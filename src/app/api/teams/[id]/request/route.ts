export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { message, phone } = await req.json();
  if (!message?.trim() || !phone?.trim()) {
    return NextResponse.json({ error: "Message and phone number are required" }, { status: 400 });
  }

  const team = await prisma.team.findUnique({ where: { id: params.id }, include: { leader: { select: { id: true, name: true } } } });
  if (!team || !team.isActive) return NextResponse.json({ error: "Team not found" }, { status: 404 });

  if (team.leaderId === auth.userId) {
    return NextResponse.json({ error: "You are the leader of this team" }, { status: 400 });
  }

  const existing = await prisma.teamMember.findUnique({ where: { userId: auth.userId } });
  if (existing) return NextResponse.json({ error: "You are already in a team" }, { status: 400 });

  const activePass = await prisma.userPass.findFirst({ where: { userId: auth.userId, status: "ACTIVE" } });
  if (!activePass) return NextResponse.json({ error: "An active pass is required to join a team" }, { status: 400 });

  const existingRequest = await prisma.teamJoinRequest.findUnique({
    where: { teamId_userId: { teamId: params.id, userId: auth.userId } },
  });
  if (existingRequest) {
    if (existingRequest.status === "PENDING") {
      return NextResponse.json({ error: "Demande déjà envoyée" }, { status: 400 });
    }
    await prisma.teamJoinRequest.update({
      where: { id: existingRequest.id },
      data: { message: message.trim(), phone: phone.trim(), status: "PENDING" },
    });
  } else {
    await prisma.teamJoinRequest.create({
      data: { teamId: params.id, userId: auth.userId, message: message.trim(), phone: phone.trim() },
    });
  }

  const requesterUser = await prisma.user.findUnique({ where: { id: auth.userId }, select: { name: true } });
  await prisma.notification.create({
    data: {
      userId: team.leaderId,
      title: `Demande pour rejoindre ${team.name}`,
      message: `${requesterUser?.name || "Un utilisateur"} souhaite rejoindre votre équipe. Tél: ${phone.trim()}. Message: ${message.trim()}`,
      type: "team_request",
    },
  });

  return NextResponse.json({ success: true });
}
