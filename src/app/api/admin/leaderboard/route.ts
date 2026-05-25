export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

async function requireAdmin() {
  const auth = await getAuthUser();
  if (!auth || auth.role !== "ADMIN") return null;
  return auth;
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const top = await prisma.user.findMany({
    where: { isActive: true },
    select: { id: true, name: true, email: true, totalInvested: true, totalEarnings: true, level: true, isVerified: true, createdAt: true },
    orderBy: { totalInvested: "desc" },
    take: 100,
  });
  return NextResponse.json({ leaderboard: top.map((u, i) => ({ ...u, rank: i + 1 })) });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { action } = await req.json();
  if (action === "reset") {
    await prisma.leaderboardEntry.deleteMany();
    await prisma.adminLog.create({ data: { adminId: auth.userId, adminEmail: auth.email, action: "RESET_LEADERBOARD" } });
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
}
