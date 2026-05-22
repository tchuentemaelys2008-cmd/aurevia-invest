import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const auth = await getAuthUser();
    if (!auth) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [user, activePasses, recentTransactions, last7DaysTx] = await Promise.all([
      prisma.user.findUnique({
        where: { id: auth.userId },
        select: { id: true, name: true, balance: true, totalEarnings: true, totalInvested: true, referralCode: true },
      }),
      prisma.userPass.findMany({
        where: { userId: auth.userId, status: "ACTIVE" },
        include: { pass: true },
        take: 5,
      }),
      prisma.transaction.findMany({
        where: { userId: auth.userId },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.transaction.findMany({
        where: { userId: auth.userId, status: "SUCCESS", createdAt: { gte: since } },
        select: { amount: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    const currentBalance = user?.balance ?? 0;

    // Sum of amounts over the 7-day window (to find balance at window start)
    const totalInWindow = last7DaysTx.reduce((sum, t) => sum + t.amount, 0);
    const balanceAtStart = currentBalance - totalInWindow;

    // Build cumulative balance per day
    const dayMap: Record<string, number> = {};
    for (const tx of last7DaysTx) {
      const d = tx.createdAt.toISOString().split("T")[0];
      dayMap[d] = (dayMap[d] ?? 0) + tx.amount;
    }

    let running = balanceAtStart;
    const chartPoints = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(since.getTime() + i * 24 * 60 * 60 * 1000);
      const dayStr = date.toISOString().split("T")[0];
      running += dayMap[dayStr] ?? 0;
      return { day: i, label: date.toLocaleDateString("fr-FR", { weekday: "short" }), value: Math.max(0, running) };
    });

    return NextResponse.json({ user, activePasses, recentTransactions, chartPoints });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
