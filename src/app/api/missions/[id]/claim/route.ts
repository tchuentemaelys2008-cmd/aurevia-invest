import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const mission = await prisma.mission.findUnique({ where: { id: params.id } });
  if (!mission || !mission.isActive) return NextResponse.json({ error: "Mission introuvable" }, { status: 404 });

  const existing = await prisma.userMission.findUnique({ where: { userId_missionId: { userId: auth.userId, missionId: params.id } } });
  if (existing?.completed) return NextResponse.json({ error: "Déjà réclamé" }, { status: 400 });

  // Compute real progress based on mission type
  const user = await prisma.user.findUnique({ where: { id: auth.userId }, select: { totalInvested: true, referrals: { select: { id: true } } } });
  let progress = 0;
  if (mission.type === "invest") progress = user?.totalInvested || 0;
  if (mission.type === "invite") progress = user?.referrals?.length || 0;

  if (progress < mission.target) return NextResponse.json({ error: "Mission non complétée", progress, target: mission.target }, { status: 400 });

  await prisma.$transaction([
    prisma.userMission.upsert({
      where: { userId_missionId: { userId: auth.userId, missionId: params.id } },
      create: { userId: auth.userId, missionId: params.id, progress, completed: true, completedAt: new Date() },
      update: { progress, completed: true, completedAt: new Date() },
    }),
    prisma.user.update({ where: { id: auth.userId }, data: { balance: { increment: mission.reward }, totalEarnings: { increment: mission.reward }, xp: { increment: mission.reward * 0.1 } } }),
    prisma.transaction.create({ data: { userId: auth.userId, type: "TASK_REWARD", amount: mission.reward, description: `Mission: ${mission.title}`, status: "SUCCESS" } }),
    prisma.notification.create({ data: { userId: auth.userId, title: "Mission accomplie !", message: `Vous avez gagné ${mission.reward} FCFA — ${mission.title}`, type: "success" } }),
  ]);

  return NextResponse.json({ success: true, reward: mission.reward });
}
