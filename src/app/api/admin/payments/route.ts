import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "ADMIN") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const payments = await prisma.payment.findMany({
      where: { provider: "BANK_TRANSFER" },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const userIds = Array.from(new Set(payments.map((p) => p.userId)));
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true },
    });
    const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

    const result = payments.map((p) => ({ ...p, user: userMap[p.userId] || { name: "?", email: "?" } }));
    return NextResponse.json({ payments: result });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "ADMIN") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const { reference, action } = await req.json();
    const payment = await prisma.payment.findUnique({ where: { reference } });
    if (!payment) return NextResponse.json({ error: "Paiement introuvable" }, { status: 404 });

    if (action === "approve") {
      await prisma.payment.update({ where: { reference }, data: { status: "SUCCESS" } });
      const userPass = await prisma.userPass.findFirst({ where: { paymentRef: reference } });
      if (userPass) {
        await prisma.userPass.update({ where: { id: userPass.id }, data: { status: "ACTIVE" } });
        await prisma.user.update({ where: { id: payment.userId }, data: { totalInvested: { increment: payment.amount } } });
        await prisma.transaction.create({
          data: { userId: payment.userId, type: "PASS_PURCHASE", amount: -payment.amount, description: "Achat Pass — virement bancaire confirmé", status: "SUCCESS", reference },
        });
        await prisma.notification.create({
          data: { userId: payment.userId, title: "Pass activé !", message: "Votre virement a été reçu. Votre pass est maintenant actif.", type: "success" },
        });
        // Referral commission
        const buyer = await prisma.user.findUnique({ where: { id: payment.userId }, select: { referredById: true } });
        if (buyer?.referredById) {
          const commission = parseFloat((payment.amount * 0.10).toFixed(2));
          await prisma.user.update({ where: { id: buyer.referredById }, data: { balance: { increment: commission }, totalEarnings: { increment: commission } } });
          await prisma.transaction.create({ data: { userId: buyer.referredById, type: "REFERRAL_BONUS", amount: commission, description: "Commission parrainage 10% — virement bancaire", status: "SUCCESS" } });
        }
      }
    } else if (action === "reject") {
      await prisma.payment.update({ where: { reference }, data: { status: "FAILED" } });
      await prisma.userPass.updateMany({ where: { paymentRef: reference }, data: { status: "CANCELLED" } });
      await prisma.notification.create({
        data: { userId: payment.userId, title: "Virement non confirmé", message: "Votre preuve de paiement n'a pas pu être validée. Contactez le support.", type: "error" },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
