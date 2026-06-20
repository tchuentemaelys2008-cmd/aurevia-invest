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

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (!auth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const body = await req.json();
    const mission = await prisma.mission.update({ where: { id: params.id }, data: body });
    await prisma.adminLog.create({ data: { adminId: auth.userId, adminEmail: auth.email, action: "UPDATE_MISSION", target: params.id, details: body } });
    return NextResponse.json({ mission });
  } catch (err) {
    console.error("[admin/missions PATCH] error:", err);
    return NextResponse.json({ error: "Erreur serveur", detail: (err as Error).message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (!auth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    await prisma.mission.delete({ where: { id: params.id } });
    await prisma.adminLog.create({ data: { adminId: auth.userId, adminEmail: auth.email, action: "DELETE_MISSION", target: params.id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin/missions DELETE] error:", err);
    return NextResponse.json({ error: "Erreur serveur", detail: (err as Error).message }, { status: 500 });
  }
}
