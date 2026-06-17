export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyGeniusPayWebhook } from "@/lib/geniuspay";
import { applyDepositSuccess, payReferralCommission } from "@/lib/payments-helpers";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-webhook-signature") || "";
    const timestamp = req.headers.get("x-webhook-timestamp") || "";
    const event = req.headers.get("x-webhook-event") || "";

    // Verify signature in production
    if (process.env.NODE_ENV === "production") {
      if (!verifyGeniusPayWebhook(rawBody, timestamp, signature)) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
      // Replay attack protection: reject if timestamp is more than 5 minutes old
      if (Math.abs(Date.now() / 1000 - parseInt(timestamp)) > 300) {
        return NextResponse.json({ error: "Timestamp too old" }, { status: 400 });
      }
    }

    const body = JSON.parse(rawBody);
    const txData = body.data;
    if (!txData) return NextResponse.json({ received: true });

    // Retrieve our internal reference from metadata
    const reference =
      txData.metadata?.external_reference || txData.reference;
    if (!reference) return NextResponse.json({ received: true });

    const payment = await prisma.payment.findUnique({ where: { reference } });
    if (!payment) return NextResponse.json({ received: true });

    if (event === "payment.success" || txData.status === "completed") {
      if (payment.status === "SUCCESS") return NextResponse.json({ received: true });

      // Balance top-up (deposit): credit the balance, no pass to activate.
      if (payment.passId === "DEPOSIT") {
        await applyDepositSuccess(reference);
        return NextResponse.json({ received: true });
      }

      await prisma.payment.update({
        where: { reference },
        data: {
          status: "SUCCESS",
          metadata: {
            geniuspay_id: txData.id,
            geniuspay_ref: txData.reference,
            provider: txData.provider,
          },
        },
      });

      const userPass = await prisma.userPass.findFirst({
        where: { paymentRef: reference, status: "PENDING" },
      });

      if (userPass) {
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
          data: {
            userId: payment.userId,
            type: "PASS_PURCHASE",
            amount: -payment.amount,
            description: `Achat Pass GeniusPay — ${reference}`,
            status: "SUCCESS",
            reference,
          },
        });

        await prisma.notification.create({
          data: {
            userId: payment.userId,
            title: "Paiement confirmé !",
            message: "Votre pass a été activé via GeniusPay.",
            type: "success",
          },
        });

        await payReferralCommission(payment.userId, payment.amount);
      }
    } else if (
      event === "payment.failed" ||
      event === "payment.cancelled" ||
      event === "payment.expired" ||
      txData.status === "failed" ||
      txData.status === "cancelled" ||
      txData.status === "expired"
    ) {
      await prisma.payment.update({ where: { reference }, data: { status: "FAILED" } });
      await prisma.userPass.updateMany({
        where: { paymentRef: reference },
        data: { status: "CANCELLED" },
      });
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("GeniusPay webhook error:", err);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
