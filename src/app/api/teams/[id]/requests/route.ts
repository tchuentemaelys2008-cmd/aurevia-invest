export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const team = await prisma.team.findUnique({ where: { id: params.id } });
  if (!team) return NextResponse.json({ error: "Équipe introuvable" }, { status: 404 });
  if (team.leaderId !== auth.userId) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const requests = await prisma.teamJoinRequest.findMany({
    where: { teamId: params.id, status: "PENDING" },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ requests });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { requestId, action } = await req.json();
  if (!requestId || !["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 });
  }

  const team = await prisma.team.findUnique({ where: { id: params.id } });
  if (!team || team.leaderId !== auth.userId) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const request = await prisma.teamJoinRequest.findUnique({
    where: { id: requestId },
    include: { user: { select: { name: true } } },
  });
  if (!request || request.teamId !== params.id) {
    return NextResponse.json({ error: "Demande introuvable" }, { status: 404 });
  }

  await prisma.teamJoinRequest.update({ where: { id: requestId }, data: { status: action === "approve" ? "APPROVED" : "REJECTED" } });

  if (action === "approve") {
    const alreadyMember = await prisma.teamMember.findUnique({ where: { userId: request.userId } });
    if (!alreadyMember) {
      await prisma.teamMember.create({ data: { teamId: params.id, userId: request.userId } });
    }
    await prisma.notification.create({
      data: {
        userId: request.userId,
        title: `Demande acceptée — ${team.name}`,
        message: `Votre demande pour rejoindre l'équipe "${team.name}" a été acceptée !`,
        type: "success",
      },
    });
  } else {
    await prisma.notification.create({
      data: {
        userId: request.userId,
        title: `Demande refusée — ${team.name}`,
        message: `Votre demande pour rejoindre l'équipe "${team.name}" a été refusée.`,
        type: "error",
      },
    });
  }

  return NextResponse.json({ success: true });
}
