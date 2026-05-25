export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const REFERRAL_COMMISSION_RATE = 0.10;

export async function POST(req: NextRequest) {
  try {
    const { reference } = await req.json();
    if (!reference) return NextResponse.json({ error: "Reference requise" }, { status: 400 });
    const payment = await prisma.payment.findUnique({ where: { reference } });
    if (!payment) return NextResponse.json({ error: "Paiement introuvable" }, { status: 404 });

    if (payment.status === "SUCCESS") return NextResponse.json({ success: true });

    await prisma.payment.update({ where: { reference }, data: { status: "SUCCESS" } });

    const userPass = await prisma.userPass.findFirst({ where: { paymentRef: reference } });
    if (userPass) {
      await prisma.userPass.update({ where: { id: userPass.id }, data: { status: "ACTIVE" } });
      await prisma.user.update({ where: { id: payment.userId }, data: { totalInvested: { increment: payment.amount } } });
      await prisma.transaction.create({
        data: { userId: payment.userId, type: "PASS_PURCHASE", amount: -payment.amount, description: "Achat Pass - Ref: " + reference, status: "SUCCESS", reference },
      });
      await prisma.notification.create({
        data: { userId: payment.userId, title: "Pass activÃ© !", message: "Votre pass est maintenant actif. Vos revenus journaliers dÃ©marrent aujourd'hui.", type: "success" },
      });

      // Commission parrainage 10%
      const buyer = await prisma.user.findUnique({ where: { id: payment.userId }, select: { referredById: true } });
      if (buyer?.referredById) {
        const commission = parseFloat((payment.amount * REFERRAL_COMMISSION_RATE).toFixed(2));
        await prisma.user.update({
          where: { id: buyer.referredById },
          data: { balance: { increment: commission }, totalEarnings: { increment: commission } },
        });
        await prisma.transaction.create({
          data: { userId: buyer.referredById, type: "REFERRAL_BONUS", amount: commission, description: `Commission parrainage 10% â€” achat de pass`, status: "SUCCESS" },
        });
        await prisma.notification.create({
          data: { userId: buyer.referredById, title: "Commission de parrainage !", message: `Vous avez reÃ§u ${commission} FCFA (10%) grÃ¢ce Ã  votre filleul.`, type: "success" },
        });
      }
    }
    return NextResponse.json({ success: true });
  } catch (err) { console.error(err); return NextResponse.json({ error: "Erreur serveur" }, { status: 500 }); }
}
