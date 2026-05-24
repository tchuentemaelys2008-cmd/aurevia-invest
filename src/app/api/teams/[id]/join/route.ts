import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const existing = await prisma.teamMember.findUnique({ where: { userId: auth.userId } });
  if (existing) return NextResponse.json({ error: "Déjà dans une équipe" }, { status: 400 });

  const team = await prisma.team.findUnique({ where: { id: params.id } });
  if (!team || !team.isActive) return NextResponse.json({ error: "Équipe introuvable" }, { status: 404 });

  await prisma.teamMember.create({ data: { teamId: params.id, userId: auth.userId } });
  return NextResponse.json({ success: true });
}
