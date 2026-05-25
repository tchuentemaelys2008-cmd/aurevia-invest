export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

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

  await prisma.$transaction([
    prisma.giftClaim.create({ data: { codeId: giftCode.id, userId: auth.userId } }),
    prisma.user.update({ where: { id: auth.userId }, data: { balance: { increment: giftCode.value } } }),
    prisma.transaction.create({
      data: {
        userId: auth.userId,
        type: "REFERRAL_BONUS",
        amount: giftCode.value,
        description: `Cadeau Aurevia — Code ${giftCode.code}`,
        status: "SUCCESS",
      },
    }),
    prisma.notification.create({
      data: {
        userId: auth.userId,
        title: "Cadeau reçu !",
        message: `Vous avez reçu ${giftCode.value} FCFA via le code cadeau ${giftCode.code}.`,
        type: "success",
      },
    }),
  ]);

  return NextResponse.json({ success: true, value: giftCode.value });
}
