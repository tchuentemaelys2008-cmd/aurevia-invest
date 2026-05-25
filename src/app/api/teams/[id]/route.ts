export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const team = await prisma.team.findUnique({ where: { id: params.id } });
  if (!team) return NextResponse.json({ error: "Équipe introuvable" }, { status: 404 });

  if (team.leaderId !== auth.userId) {
    return NextResponse.json({ error: "Seul le leader peut supprimer l'équipe" }, { status: 403 });
  }

  await prisma.team.update({ where: { id: params.id }, data: { isActive: false } });
  return NextResponse.json({ success: true });
}
