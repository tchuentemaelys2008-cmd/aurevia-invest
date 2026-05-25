export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

async function requireAdmin() {
  const auth = await getAuthUser();
  if (!auth || auth.role !== "ADMIN") return null;
  return auth;
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { title, message, type = "info", targetUserId } = await req.json();
  if (!title || !message) return NextResponse.json({ error: "Titre et message requis" }, { status: 400 });

  if (targetUserId) {
    await prisma.notification.create({ data: { userId: targetUserId, title, message, type } });
  } else {
    const users = await prisma.user.findMany({ where: { isActive: true }, select: { id: true } });
    await prisma.notification.createMany({ data: users.map((u) => ({ userId: u.id, title, message, type })) });
  }

  await prisma.adminLog.create({ data: { adminId: auth.userId, adminEmail: auth.email, action: targetUserId ? "SEND_NOTIF_TARGETED" : "SEND_NOTIF_GLOBAL", details: { title, message, targetUserId } } });
  return NextResponse.json({ success: true });
}
