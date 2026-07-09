export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { applyDepositSuccess, payReferralCommission } from "@/lib/payments-helpers";
import { xpFromAmount, syncUserLevel } from "@/lib/xp";

// Re-check of a transaction straight from Fapshi. Returns null when it can't
// be checked (missing creds/transId, network or shape issue).
async function fapshiVerify(transId: string): Promise<{ status?: string; amount?: number; externalId?: string } | null> {
  if (!transId || !process.env.FAPSHI_USER || !process.env.FAPSHI_KEY || !process.env.FAPSHI_BASE_URL) return null;
  try {
    const res = await fetch(`${process.env.FAPSHI_BASE_URL}/payment-status/${encodeURIComponent(transId)}`, {
      headers: { apiuser: process.env.FAPSHI_USER, apikey: process.env.FAPSHI_KEY },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * FAPSHI Webhook Handler
 * Called by FAPSHI when payment status changes
 * Set your webhook URL in FAPSHI dashboard: https://your-domain.com/api/payments/fapshi/webhook
 */
export async function POST(req: NextRequest) {
  try {
    // Verify webhook signature (FAPSHI sends a signature header)
    const signature = req.headers.get("x-fapshi-signature");
    // TODO: validate signature against FAPSHI_WEBHOOK_SECRET env var
    void signature;

    const body = await req.json();
    const { transId, status, externalId } = body;

    // externalId is our payment reference
    const reference = externalId;
    if (!reference) return NextResponse.json({ error: "No reference" }, { status: 400 });

    const payment = await prisma.payment.findUnique({ where: { reference } });
    if (!payment) return NextResponse.json({ error: "Payment not found" }, { status: 404 });

    if (status === "SUCCESSFUL") {
      if (payment.status === "SUCCESS") return NextResponse.json({ received: true });

      // SECURITY: the webhook body is unauthenticated and therefore forgeable.
      // In production we FAIL CLOSED: the transaction must be re-checked
      // server-to-server with Fapshi and confirmed SUCCESSFUL with the right
      // amount before we credit anything. A 502 makes Fapshi retry later, so a
      // transient network error never loses a legitimate payment — it only
      // delays it. Without this, anyone could POST {status:"SUCCESSFUL",
      // externalId:"<their ref>"} and get a free pass or deposit.
      if (process.env.NODE_ENV === "production") {
        if (!transId) {
          console.error("FAPSHI webhook rejected: missing transId", { reference });
          return NextResponse.json({ error: "Missing transId" }, { status: 400 });
        }
        const verified = await fapshiVerify(transId);
        if (!verified) {
          console.error("FAPSHI webhook: verification unavailable, will retry", { transId, reference });
          return NextResponse.json({ error: "Verification unavailable" }, { status: 502 });
        }
        const vstatus = String(verified.status || "").toUpperCase();
        if (vstatus !== "SUCCESSFUL") {
          console.error("FAPSHI webhook rejected: Fapshi reports", vstatus, { transId, reference });
          return NextResponse.json({ error: "Not successful" }, { status: 400 });
        }
        if (typeof verified.amount === "number" && verified.amount < payment.amount) {
          console.error("FAPSHI webhook rejected: amount mismatch", { transId, reference, expected: payment.amount, got: verified.amount });
          return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
        }
      }

      // Balance top-up (deposit): credit the balance, no pass to activate.
      if (payment.passId === "DEPOSIT") {
        await applyDepositSuccess(reference);
        return NextResponse.json({ received: true });
      }

      // Activate payment and pass
      await prisma.payment.update({ where: { reference }, data: { status: "SUCCESS", metadata: { transId } } });
      const userPass = await prisma.userPass.findFirst({ where: { paymentRef: reference } });
      if (userPass && userPass.status === "PENDING") {
        const startDate = new Date();
        const endDate = new Date(startDate);
        const pass = await prisma.pass.findUnique({ where: { id: userPass.passId } });
        if (pass) endDate.setDate(endDate.getDate() + pass.duration);

        await prisma.userPass.update({
          where: { id: userPass.id },
          data: { status: "ACTIVE", startDate, endDate },
        });
        await prisma.user.update({
          where: { id: payment.userId },
          data: { totalInvested: { increment: payment.amount }, xp: { increment: xpFromAmount(payment.amount) } },
        });
        await prisma.transaction.create({
          data: { userId: payment.userId, type: "PASS_PURCHASE", amount: -payment.amount, description: "Achat Pass FAPSHI - " + reference, status: "SUCCESS", reference },
        });
        await prisma.notification.create({
          data: { userId: payment.userId, title: "Paiement confirmé !", message: `Votre pass a été activé via FAPSHI.`, type: "success" },
        });

        await syncUserLevel(payment.userId);
        await payReferralCommission(payment.userId, payment.amount);
      }
    } else if (status === "FAILED" || status === "CANCELLED") {
      await prisma.payment.update({ where: { reference }, data: { status: "FAILED" } });
      await prisma.userPass.updateMany({ where: { paymentRef: reference }, data: { status: "CANCELLED" } });
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("FAPSHI webhook error:", err);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
