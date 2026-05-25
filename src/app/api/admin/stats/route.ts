export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (!auth) return NextResponse.json({ error: "AccÃ¨s refusÃ©" }, { status: 403 });

    const [totalUsers, activeUsers, totalRevenue, totalDeposits, totalWithdrawals, activePasses, pendingWithdrawals, recentUsers, convertedUsers] = await Promise.all([
      prisma.user.count({ where: { role: "USER" } }),
      prisma.user.count({ where: { role: "USER", isActive: true, isSuspended: false } }),
      prisma.payment.aggregate({ where: { status: "SUCCESS" }, _sum: { amount: true } }),
      prisma.transaction.aggregate({ where: { status: "SUCCESS", amount: { gt: 0 } }, _sum: { amount: true } }),
      prisma.withdrawal.aggregate({ where: { status: { in: ["APPROVED", "PROCESSED"] } }, _sum: { amount: true } }),
      prisma.userPass.count({ where: { status: "ACTIVE" } }),
      prisma.withdrawal.count({ where: { status: "PENDING" } }),
      prisma.user.findMany({ where: { role: "USER" }, orderBy: { createdAt: "desc" }, take: 5, select: { id: true, name: true, email: true, balance: true, createdAt: true } }),
      prisma.user.count({ where: { role: "USER", totalInvested: { gt: 0 } } }),
    ]);

    return NextResponse.json({
      totalUsers,
      activeUsers,
      totalRevenue: totalRevenue._sum.amount || 0,
      totalDeposits: totalDeposits._sum.amount || 0,
      totalWithdrawals: totalWithdrawals._sum.amount || 0,
      conversionRate: totalUsers ? Math.round((convertedUsers / totalUsers) * 1000) / 10 : 0,
      activePasses,
      pendingWithdrawals,
      recentUsers,
    });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
