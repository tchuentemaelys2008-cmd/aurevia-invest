export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { seedLeaderboard } from "@/lib/display-names";

export async function GET() {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  // Real users with active passes (ranked by what they actually invested).
  const realUsers = await prisma.user.findMany({
    where: { isActive: true },
    select: { id: true, name: true, totalInvested: true, totalEarnings: true, level: true, isVerified: true },
    orderBy: { totalInvested: "desc" },
    take: 200,
  });

  // Seed entries (from the same roster as the live purchase ticker) keep the
  // board populated before/while real purchases ramp up. Real users merge in
  // by totalInvested and outrank the seeds as their investment grows.
  const seeds = seedLeaderboard();

  const combined = [...realUsers, ...seeds].sort(
    (a, b) => b.totalInvested - a.totalInvested
  );

  const ranked = combined.map((u, i) => ({ ...u, rank: i + 1 }));
  const leaderboard = ranked.slice(0, 50);
  const myRank = ranked.find((u) => u.id === auth.userId) || null;

  return NextResponse.json({ leaderboard, myRank });
}
