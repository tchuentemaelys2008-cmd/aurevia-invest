export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  try {
    const auth = await getAuthUser();
    const [teams, membership] = await Promise.all([
      prisma.team.findMany({
        where: { isActive: true },
        include: { leader: { select: { id: true, name: true } }, _count: { select: { members: true } } },
        orderBy: { totalInvested: "desc" },
        take: 30,
      }),
      auth ? prisma.teamMember.findUnique({ where: { userId: auth.userId }, include: { team: { select: { id: true, name: true } } } }) : null,
    ]);
    return NextResponse.json({ teams, myMemberTeamId: membership?.teamId ?? null, myTeamName: membership?.team?.name ?? null });
  } catch {
    return NextResponse.json({ teams: [], myMemberTeamId: null, myTeamName: null });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });

    const { name } = await req.json();
    if (!name?.trim()) return NextResponse.json({ error: "Nom requis" }, { status: 400 });

    const existing = await prisma.teamMember.findUnique({ where: { userId: auth.userId } });
    if (existing) return NextResponse.json({ error: "Vous etes deja dans une equipe" }, { status: 400 });

    const team = await prisma.team.create({
      data: {
        name: name.trim(),
        leaderId: auth.userId,
        members: { create: { userId: auth.userId } },
      },
    });

    return NextResponse.json({ team });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
