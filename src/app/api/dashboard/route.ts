import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const auth = await getAuthUser();
    if (!auth) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const [user, activePasses, recentTransactions, chartData] = await Promise.all([
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
      // Generate chart data from transactions (last 7 days)
      prisma.transaction.groupBy({
        by: ["createdAt"],
        where: { userId: auth.userId, status: "SUCCESS", createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
        _sum: { amount: true },
      }),
    ]);

    // Build 7-day chart points
    const points = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000);
      const dayStr = date.toISOString().split("T")[0];
      const found = chartData.find((d) => d.createdAt.toISOString().split("T")[0] === dayStr);
      return { day: i, value: (user?.balance || 0) - (found?._sum?.amount || 0) + (i * 150) };
    });

    return NextResponse.json({ user, activePasses, recentTransactions, chartPoints: points });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
