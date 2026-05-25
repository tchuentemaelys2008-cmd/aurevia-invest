export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

async function requireAdmin() {
  const auth = await getAuthUser();
  if (!auth) return null;
  const user = await prisma.user.findUnique({ where: { id: auth.userId }, select: { role: true } });
  if (!user || !["ADMIN", "SUPER_ADMIN"].includes(user.role)) return null;
  return auth;
}

export async function GET() {
  const auth = await requireAdmin();
  if (!auth) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const codes = await prisma.giftCode.findMany({
    include: { claims: { include: { user: { select: { name: true, email: true } } } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ codes });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const { code, description, value, maxWinners, isActive } = await req.json();
  if (!code?.trim() || !value || value <= 0) {
    return NextResponse.json({ error: "Code et valeur requis" }, { status: 400 });
  }

  const giftCode = await prisma.giftCode.create({
    data: {
      code: code.trim().toUpperCase(),
      description: description?.trim() || null,
      value: parseFloat(value),
      maxWinners: parseInt(maxWinners) || 3,
      isActive: Boolean(isActive),
    },
  });
  return NextResponse.json({ giftCode });
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const { id, isActive } = await req.json();
  if (!id) return NextResponse.json({ error: "ID requis" }, { status: 400 });

  const updated = await prisma.giftCode.update({ where: { id }, data: { isActive: Boolean(isActive) } });
  return NextResponse.json({ giftCode: updated });
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "ID requis" }, { status: 400 });

  await prisma.giftCode.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
