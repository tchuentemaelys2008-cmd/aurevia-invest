import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== "ADMIN") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const [totalUsers, activeUsers, totalRevenue, activePasses, pendingWithdrawals, recentUsers] = await Promise.all([
      prisma.user.count({ where: { role: "USER" } }),
      prisma.user.count({ where: { role: "USER", isActive: true } }),
      prisma.payment.aggregate({ where: { status: "SUCCESS" }, _sum: { amount: true } }),
      prisma.userPass.count({ where: { status: "ACTIVE" } }),
      prisma.withdrawal.count({ where: { status: "PENDING" } }),
      prisma.user.findMany({ where: { role: "USER" }, orderBy: { createdAt: "desc" }, take: 5, select: { id: true, name: true, email: true, balance: true, createdAt: true } }),
    ]);

    return NextResponse.json({
      totalUsers, activeUsers,
      totalRevenue: totalRevenue._sum.amount || 0,
      activePasses,
      pendingWithdrawals,
      recentUsers,
    });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
