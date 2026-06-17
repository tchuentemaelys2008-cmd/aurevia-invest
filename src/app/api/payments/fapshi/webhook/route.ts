export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { applyDepositSuccess, payReferralCommission } from "@/lib/payments-helpers";

// Fapshi webhooks arrive unauthenticated, so we never trust the body alone: we
// re-check the transaction straight from Fapshi before crediting anything.
// Fails closed — if we can't confirm, we don't credit.
async function fapshiVerify(transId: string): Promise<{ status?: string; amount?: number } | null> {
  if (!transId || !process.env.FAPSHI_USER || !process.env.FAPSHI_KEY || !process.env.FAPSHI_BASE_URL) return null;
  try {
    const res = await fetch(`${process.env.FAPSHI_BASE_URL}/payment-status/${transId}`, {
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

      // SECURITY: confirm the transaction with Fapshi directly before crediting
      // (the webhook body is forgeable). Fails closed in production.
      if (process.env.NODE_ENV === "production") {
        const verified = await fapshiVerify(transId);
        if (!verified || verified.status !== "SUCCESSFUL" || (typeof verified.amount === "number" && verified.amount < payment.amount)) {
          console.error("FAPSHI webhook rejected: verification failed", { transId, reference });
          return NextResponse.json({ error: "Verification failed" }, { status: 400 });
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
          data: { totalInvested: { increment: payment.amount } },
        });
        await prisma.transaction.create({
          data: { userId: payment.userId, type: "PASS_PURCHASE", amount: -payment.amount, description: "Achat Pass FAPSHI - " + reference, status: "SUCCESS", reference },
        });
        await prisma.notification.create({
          data: { userId: payment.userId, title: "Paiement confirmé !", message: `Votre pass a été activé via FAPSHI.`, type: "success" },
        });

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
