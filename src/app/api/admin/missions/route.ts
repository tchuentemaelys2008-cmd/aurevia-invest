export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

// Rôles autorisés à gérer les missions (cohérent avec le middleware)
const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN", "MODERATOR"];

async function requireAdmin() {
  const auth = await getAuthUser();
  if (!auth || !ADMIN_ROLES.includes(auth.role)) return null;
  return auth;
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const missions = await prisma.mission.findMany({
    include: { _count: { select: { userMissions: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ missions });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    const mission = await prisma.mission.create({
      data: {
        title: String(body.title || ""),
        titleEn: body.titleEn ? String(body.titleEn) : null,
        description: body.description ? String(body.description) : null,
        descriptionEn: body.descriptionEn ? String(body.descriptionEn) : null,
        type: String(body.type || "task"),
        target: Number(body.target) || 0,
        reward: Number(body.reward) || 0,
        rewardType: String(body.rewardType || "money"),
        period: String(body.period || "all_time"),
        isActive: body.isActive ?? true,
      },
    });

    await prisma.adminLog.create({
      data: {
        adminId: auth.userId,
        adminEmail: auth.email,
        action: "CREATE_MISSION",
        target: mission.id,
        details: body,
      },
    });

    return NextResponse.json({ mission });
  } catch (err) {
    console.error("[admin/missions POST] error:", err);
    return NextResponse.json({ error: "Erreur serveur", detail: (err as Error).message }, { status: 500 });
  }
}
