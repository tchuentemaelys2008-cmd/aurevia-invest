import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const member = await prisma.teamMember.findUnique({ where: { userId: auth.userId } });
  if (!member || member.teamId !== params.id) return NextResponse.json({ error: "Pas membre de cette équipe" }, { status: 400 });

  const team = await prisma.team.findUnique({ where: { id: params.id } });
  if (team?.leaderId === auth.userId) return NextResponse.json({ error: "Le leader ne peut pas quitter l'équipe" }, { status: 400 });

  await prisma.teamMember.delete({ where: { userId: auth.userId } });
  return NextResponse.json({ success: true });
}
