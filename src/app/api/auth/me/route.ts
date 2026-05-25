export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, signToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const auth = await getAuthUser();
    if (!auth) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { id: true, name: true, email: true, phone: true, role: true, referralCode: true, balance: true, totalEarnings: true, totalInvested: true, isVerified: true, isSuspended: true, createdAt: true },
    });
    if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    if (user.isSuspended) return NextResponse.json({ error: "Compte suspendu" }, { status: 403 });
    await prisma.user.update({ where: { id: user.id }, data: { lastActive: new Date() } });

    const res = NextResponse.json({ user });

    if (user.role !== auth.role) {
      const newToken = signToken({ userId: user.id, email: user.email, role: user.role });
      res.cookies.set("auth-token", newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 604800,
      });
    }

    return res;
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const { name, phone } = await req.json();
    const updateData: { name?: string; phone?: string } = {};

    if (name?.trim()) updateData.name = name.trim();
    if (phone !== undefined) {
      if (phone.trim()) {
        const existing = await prisma.user.findFirst({ where: { phone: phone.trim(), NOT: { id: auth.userId } } });
        if (existing) return NextResponse.json({ error: "Ce numéro est déjà utilisé" }, { status: 400 });
        updateData.phone = phone.trim();
      } else {
        updateData.phone = "";
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "Aucune donnée à mettre à jour" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: auth.userId },
      data: updateData,
      select: { id: true, name: true, email: true, phone: true, referralCode: true },
    });

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
