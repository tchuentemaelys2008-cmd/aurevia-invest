export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

async function requireAdmin() {
  const auth = await getAuthUser();
  if (!auth || auth.role !== "ADMIN") return null;
  return auth;
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  const seg = await prisma.spinConfig.update({ where: { id: params.id }, data: body });
  return NextResponse.json({ segment: seg });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await prisma.spinConfig.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
