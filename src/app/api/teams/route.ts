import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  const teams = await prisma.team.findMany({
    where: { isActive: true },
    include: { leader: { select: { name: true } }, _count: { select: { members: true } } },
    orderBy: { totalInvested: "desc" },
    take: 30,
  });
  return NextResponse.json({ teams });
}

export async function POST(req: NextRequest) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { name } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Nom requis" }, { status: 400 });

  const existing = await prisma.teamMember.findUnique({ where: { userId: auth.userId } });
  if (existing) return NextResponse.json({ error: "Vous êtes déjà dans une équipe" }, { status: 400 });

  const team = await prisma.team.create({
    data: {
      name: name.trim(),
      leaderId: auth.userId,
      members: { create: { userId: auth.userId } },
    },
  });

  return NextResponse.json({ team });
}
