export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, logAdminAction } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { nanoid } from "nanoid";

const schema = z.object({ userId: z.string().min(1), passId: z.string().min(1) });

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  try {
    const { userId, passId } = schema.parse(await req.json());

    const [user, pass] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true } }),
      prisma.pass.findUnique({ where: { id: passId } }),
    ]);
    if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    if (!pass) return NextResponse.json({ error: "Pass introuvable" }, { status: 404 });

    const reference = `ADM-${nanoid(12).toUpperCase()}`;
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + pass.duration);

    // Same shape as an external (GeniusPay/Fapshi) purchase: a SUCCESS payment,
    // an ACTIVE pass, totalInvested credit and a PASS_PURCHASE entry — but the
    // user's balance is untouched (admin grant). No referral commission.
    await prisma.$transaction([
      prisma.payment.create({ data: { userId, passId, amount: pass.price, provider: "ADMIN", reference, status: "SUCCESS" } }),
      prisma.userPass.create({ data: { userId, passId, status: "ACTIVE", startDate, endDate, amountPaid: pass.price, paymentRef: reference } }),
      prisma.user.update({ where: { id: userId }, data: { totalInvested: { increment: pass.price } } }),
      prisma.transaction.create({ data: { userId, type: "PASS_PURCHASE", amount: -pass.price, description: `Activation Pass ${pass.name} (admin)`, status: "SUCCESS", reference } }),
      prisma.notification.create({ data: { userId, title: "Pass activé 🎉", message: `Un administrateur a activé votre pass ${pass.name}. Vos revenus journaliers démarrent aujourd'hui.`, type: "success" } }),
    ]);

    await logAdminAction(admin, "ACTIVATE_PASS", userId, { passId, passName: pass.name, price: pass.price }, req);

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    console.error("Admin activate-pass error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
