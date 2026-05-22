import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const auth = await getAuthUser();
    if (!auth) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const [user, transactions, withdrawals, passCount] = await Promise.all([
      prisma.user.findUnique({
        where: { id: auth.userId },
        select: { balance: true, totalEarnings: true, totalInvested: true },
      }),
      prisma.transaction.findMany({
        where: { userId: auth.userId },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.withdrawal.findMany({
        where: { userId: auth.userId },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.userPass.count({ where: { userId: auth.userId, status: { in: ["ACTIVE", "EXPIRED"] } } }),
    ]);

    return NextResponse.json({ wallet: user, transactions, withdrawals, hasPass: passCount > 0 });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
