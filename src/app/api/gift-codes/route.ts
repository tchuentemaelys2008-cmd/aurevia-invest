export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { xpFromAmount, syncUserLevel } from "@/lib/xp";

export async function POST(req: NextRequest) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { code } = await req.json();
  if (!code?.trim()) return NextResponse.json({ error: "Code requis" }, { status: 400 });

  const giftCode = await prisma.giftCode.findUnique({
    where: { code: code.trim().toUpperCase() },
    include: { claims: true },
  });

  if (!giftCode) return NextResponse.json({ error: "gift_invalid" }, { status: 404 });
  if (!giftCode.isActive) return NextResponse.json({ error: "gift_inactive" }, { status: 403 });

  const alreadyClaimed = giftCode.claims.some((c) => c.userId === auth.userId);
  if (alreadyClaimed) return NextResponse.json({ error: "gift_already" }, { status: 400 });

  if (giftCode.claims.length >= giftCode.maxWinners) {
    return NextResponse.json({ error: "gift_full" }, { status: 400 });
  }

  // Le quota maxWinners est re-vérifié DANS la transaction, après création du
  // claim : des réclamations simultanées ne peuvent pas dépasser le quota
  // (la transaction en trop est annulée). L'unicité (codeId, userId) bloque
  // déjà le double claim d'un même utilisateur.
  try {
    await prisma.$transaction(async (tx) => {
      await tx.giftClaim.create({ data: { codeId: giftCode.id, userId: auth.userId } });
      const claimCount = await tx.giftClaim.count({ where: { codeId: giftCode.id } });
      if (claimCount > giftCode.maxWinners) throw new Error("gift_full");
      await tx.user.update({ where: { id: auth.userId }, data: { balance: { increment: giftCode.value }, xp: { increment: xpFromAmount(giftCode.value) } } });
      await tx.transaction.create({
        data: {
          userId: auth.userId,
          type: "REFERRAL_BONUS",
          amount: giftCode.value,
          description: `Cadeau Aurevia — Code ${giftCode.code}`,
          status: "SUCCESS",
        },
      });
      await tx.notification.create({
        data: {
          userId: auth.userId,
          title: "Cadeau reçu !",
          message: `Vous avez reçu ${giftCode.value} FCFA via le code cadeau ${giftCode.code}.`,
          type: "success",
        },
      });
    });
  } catch (e) {
    if (e && typeof e === "object" && "code" in e && (e as { code?: string }).code === "P2002") {
      return NextResponse.json({ error: "gift_already" }, { status: 400 });
    }
    if (e instanceof Error && e.message === "gift_full") {
      return NextResponse.json({ error: "gift_full" }, { status: 400 });
    }
    throw e;
  }

  await syncUserLevel(auth.userId);

  return NextResponse.json({ success: true, value: giftCode.value });
}
