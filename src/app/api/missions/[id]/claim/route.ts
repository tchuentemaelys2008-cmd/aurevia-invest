export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { xpFromAmount, syncUserLevel } from "@/lib/xp";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const mission = await prisma.mission.findUnique({ where: { id: params.id } });
  if (!mission || !mission.isActive) return NextResponse.json({ error: "Mission introuvable" }, { status: 404 });

  // Compute real progress based on mission type
  const user = await prisma.user.findUnique({ where: { id: auth.userId }, select: { totalInvested: true, referrals: { select: { id: true } } } });
  let progress = 0;
  if (mission.type === "invest") progress = user?.totalInvested || 0;
  if (mission.type === "invite") progress = user?.referrals?.length || 0;

  if (progress < mission.target) return NextResponse.json({ error: "Mission non complétée", progress, target: mission.target }, { status: 400 });

  // Le marquage "completed" est conditionnel DANS la transaction : deux
  // réclamations simultanées ne peuvent pas créditer la récompense deux fois.
  const claimed = await prisma.$transaction(async (tx) => {
    const existing = await tx.userMission.findUnique({
      where: { userId_missionId: { userId: auth.userId, missionId: params.id } },
      select: { id: true },
    });
    if (existing) {
      const updated = await tx.userMission.updateMany({
        where: { userId: auth.userId, missionId: params.id, completed: false },
        data: { progress, completed: true, completedAt: new Date() },
      });
      if (updated.count === 0) return false;
    } else {
      try {
        await tx.userMission.create({
          data: { userId: auth.userId, missionId: params.id, progress, completed: true, completedAt: new Date() },
        });
      } catch (e) {
        // P2002 : créé en parallèle par une autre requête → déjà réclamé.
        if (e && typeof e === "object" && "code" in e && (e as { code?: string }).code === "P2002") return false;
        throw e;
      }
    }
    await tx.user.update({
      where: { id: auth.userId },
      data: { balance: { increment: mission.reward }, totalEarnings: { increment: mission.reward }, xp: { increment: xpFromAmount(mission.reward) } },
    });
    await tx.transaction.create({
      data: { userId: auth.userId, type: "TASK_REWARD", amount: mission.reward, description: `Mission: ${mission.title}`, status: "SUCCESS" },
    });
    await tx.notification.create({
      data: { userId: auth.userId, title: "Mission accomplie !", message: `Vous avez gagné ${mission.reward} FCFA — ${mission.title}`, type: "success" },
    });
    return true;
  });

  if (!claimed) return NextResponse.json({ error: "Déjà réclamé" }, { status: 400 });

  await syncUserLevel(auth.userId);

  return NextResponse.json({ success: true, reward: mission.reward });
}
