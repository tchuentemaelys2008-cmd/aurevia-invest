import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    const body = await req.json();
    const { transId, status, externalId } = body;

    // externalId is our payment reference
    const reference = externalId;
    if (!reference) return NextResponse.json({ error: "No reference" }, { status: 400 });

    const payment = await prisma.payment.findUnique({ where: { reference } });
    if (!payment) return NextResponse.json({ error: "Payment not found" }, { status: 404 });

    if (status === "SUCCESSFUL") {
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

        // Handle referral commission
        const user = await prisma.user.findUnique({ where: { id: payment.userId }, select: { referredById: true } });
        if (user?.referredById) {
          const commission = payment.amount * 0.05;
          await prisma.user.update({ where: { id: user.referredById }, data: { balance: { increment: commission }, totalEarnings: { increment: commission } } });
          await prisma.transaction.create({
            data: { userId: user.referredById, type: "AFFILIATE_COMMISSION", amount: commission, description: "Commission affiliation 5%", status: "SUCCESS" },
          });
        }
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
