export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getAuthUser, signToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const auth = await getAuthUser();
    if (!auth) return NextResponse.json({ error: "Non authentifiÃ©" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { id: true, name: true, email: true, phone: true, role: true, referralCode: true, balance: true, totalEarnings: true, totalInvested: true, isVerified: true, isSuspended: true, createdAt: true },
    });
    if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    if (user.isSuspended) return NextResponse.json({ error: "Compte suspendu" }, { status: 403 });
    await prisma.user.update({ where: { id: user.id }, data: { lastActive: new Date() } });

    const res = NextResponse.json({ user });

    // Refresh JWT if role in DB differs from role in token (e.g. user was promoted to ADMIN)
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
