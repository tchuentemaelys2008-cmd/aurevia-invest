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
  const missions = await prisma.mission.findMany({ include: { _count: { select: { userMissions: true } } }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ missions });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  const mission = await prisma.mission.create({ data: body });
  await prisma.adminLog.create({ data: { adminId: auth.userId, adminEmail: auth.email, action: "CREATE_MISSION", target: mission.id, details: body } });
  return NextResponse.json({ mission });
}
