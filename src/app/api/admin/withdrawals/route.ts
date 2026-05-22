import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "ADMIN") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const withdrawals = await prisma.withdrawal.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ withdrawals });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "ADMIN") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const { withdrawalId, status, notes } = await req.json();
    const withdrawal = await prisma.withdrawal.findUnique({ where: { id: withdrawalId } });
    if (!withdrawal) return NextResponse.json({ error: "Retrait introuvable" }, { status: 404 });

    await prisma.withdrawal.update({
      where: { id: withdrawalId },
      data: { status, notes, processedAt: new Date() },
    });

    // If rejected, refund balance
    if (status === "REJECTED") {
      await prisma.user.update({ where: { id: withdrawal.userId }, data: { balance: { increment: withdrawal.amount } } });
      await prisma.transaction.create({
        data: { userId: withdrawal.userId, type: "WITHDRAWAL", amount: withdrawal.amount, description: "Retrait refusé - remboursement", status: "FAILED" },
      });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
