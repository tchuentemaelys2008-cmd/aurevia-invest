import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import crypto from "node:crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email requis" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });

    // On répond toujours success pour ne pas révéler si l'email existe
    if (!user) {
      return NextResponse.json({ success: true });
    }

    // Supprimer les anciens tokens non expirés
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

    // Générer un token sécurisé
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 heure

    await prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    });

    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
    const resetUrl = `${baseUrl}/reset-password/${rawToken}`;

    if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== "re_your_resend_key") {
      await resend.emails.send({
        from: process.env.EMAIL_FROM || "noreply@aurevia-invest.com",
        to: user.email,
        subject: "Réinitialisation de votre mot de passe — Aurevia Invest",
        html: `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#070d1a;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:520px;margin:40px auto;background:#0c1428;border-radius:16px;border:1px solid rgba(255,255,255,0.08);overflow:hidden;">
    <div style="background:linear-gradient(135deg,#3b6fd4,#6c4de6);padding:32px 32px 24px;text-align:center;">
      <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:12px;padding:10px 20px;margin-bottom:12px;">
        <span style="color:#fff;font-weight:700;font-size:20px;letter-spacing:0.5px;">Aurevia Invest</span>
      </div>
      <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700;">Réinitialisation du mot de passe</h1>
    </div>
    <div style="padding:32px;">
      <p style="color:#cdd6f0;font-size:15px;margin:0 0 8px;">Bonjour <strong style="color:#fff;">${user.name}</strong>,</p>
      <p style="color:#8892aa;font-size:14px;margin:0 0 28px;line-height:1.6;">
        Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte Aurevia Invest.<br>
        Ce lien est valable pendant <strong style="color:#cdd6f0;">1 heure</strong>.
      </p>
      <div style="text-align:center;margin:0 0 28px;">
        <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#3b6fd4,#6c4de6);color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:700;font-size:15px;">
          Réinitialiser mon mot de passe
        </a>
      </div>
      <p style="color:#8892aa;font-size:12px;margin:0 0 8px;line-height:1.6;">
        Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur&nbsp;:
      </p>
      <p style="color:#3b6fd4;font-size:12px;word-break:break-all;margin:0 0 28px;">${resetUrl}</p>
      <p style="color:#8892aa;font-size:12px;margin:0;line-height:1.6;">
        Si vous n'avez pas demandé cette réinitialisation, ignorez cet email. Votre mot de passe ne sera pas modifié.
      </p>
    </div>
    <div style="background:rgba(255,255,255,0.03);padding:16px 32px;text-align:center;border-top:1px solid rgba(255,255,255,0.06);">
      <p style="color:#8892aa;font-size:12px;margin:0;">© ${new Date().getFullYear()} Aurevia Invest. Tous droits réservés.</p>
    </div>
  </div>
</body>
</html>`,
      });
    } else {
      // Dev mode — log dans la console
      console.log("\n📧 [DEV] Reset password link:", resetUrl, "\n");
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("forgot-password error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
