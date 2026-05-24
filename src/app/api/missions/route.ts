import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const [missions, userMissions] = await Promise.all([
    prisma.mission.findMany({ where: { isActive: true }, orderBy: { createdAt: "desc" } }),
    prisma.userMission.findMany({ where: { userId: auth.userId } }),
  ]);

  const map = new Map(userMissions.map((um) => [um.missionId, um]));

  return NextResponse.json({
    missions: missions.map((m) => ({
      ...m,
      userProgress: map.get(m.id) || null,
    })),
  });
}
