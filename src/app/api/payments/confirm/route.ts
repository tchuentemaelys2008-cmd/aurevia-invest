import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export async function POST(req: NextRequest) {
  try {
    const { reference } = await req.json();
    if (!reference) return NextResponse.json({ error: "Reference requise" }, { status: 400 });
    const payment = await prisma.payment.findUnique({ where: { reference } });
    if (!payment) return NextResponse.json({ error: "Paiement introuvable" }, { status: 404 });
    await prisma.payment.update({ where: { reference }, data: { status: "SUCCESS" } });
    const userPass = await prisma.userPass.findFirst({ where: { paymentRef: reference } });
    if (userPass) {
      await prisma.userPass.update({ where: { id: userPass.id }, data: { status: "ACTIVE" } });
      await prisma.user.update({ where: { id: payment.userId }, data: { totalInvested: { increment: payment.amount } } });
      await prisma.transaction.create({ data: { userId: payment.userId, type: "PASS_PURCHASE", amount: -payment.amount, description: "Achat Pass - Ref: " + reference, status: "SUCCESS", reference } });
      await prisma.notification.create({ data: { userId: payment.userId, title: "Pass active !", message: "Votre pass est maintenant actif.", type: "success" } });
    }
    return NextResponse.json({ success: true });
  } catch (err) { console.error(err); return NextResponse.json({ error: "Erreur serveur" }, { status: 500 }); }
}
