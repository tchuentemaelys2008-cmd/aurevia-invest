import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import crypto from "node:crypto";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password || typeof token !== "string" || typeof password !== "string") {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Le mot de passe doit contenir au moins 8 caractères" }, { status: 400 });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });

    if (!record || record.expiresAt < new Date()) {
      // Nettoyer les tokens expirés
      if (record) await prisma.passwordResetToken.delete({ where: { tokenHash } });
      return NextResponse.json({ error: "Lien invalide ou expiré" }, { status: 400 });
    }

    const hashed = await hashPassword(password);

    await prisma.$transaction([
      prisma.user.update({ where: { id: record.userId }, data: { password: hashed } }),
      prisma.passwordResetToken.delete({ where: { tokenHash } }),
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("reset-password error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
