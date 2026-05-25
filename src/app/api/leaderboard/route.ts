export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: "Non authentifiÃ©" }, { status: 401 });

  const top = await prisma.user.findMany({
    where: { isActive: true },
    select: { id: true, name: true, totalInvested: true, totalEarnings: true, level: true, isVerified: true },
    orderBy: { totalInvested: "desc" },
    take: 50,
  });

  const ranked = top.map((u, i) => ({ ...u, rank: i + 1 }));
  const myRank = ranked.find((u) => u.id === auth.userId);

  return NextResponse.json({ leaderboard: ranked, myRank: myRank || null });
}
