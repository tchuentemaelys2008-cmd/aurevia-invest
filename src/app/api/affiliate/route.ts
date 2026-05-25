export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const auth = await getAuthUser();
    if (!auth) return NextResponse.json({ error: "Non authentifiÃ©" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { referralCode: true, balance: true },
    });
    if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

    const [clicks, registrations, earnings] = await Promise.all([
      prisma.affiliateClick.count({ where: { userId: auth.userId } }),
      prisma.user.count({ where: { referredById: auth.userId } }),
      prisma.transaction.aggregate({
        where: { userId: auth.userId, type: "AFFILIATE_COMMISSION", status: "SUCCESS" },
        _sum: { amount: true },
      }),
    ]);

    const referralLink = `${process.env.NEXT_PUBLIC_URL || "https://aurevia-invest.com"}/register?ref=${user.referralCode}`;

    return NextResponse.json({
      referralCode: user.referralCode,
      referralLink,
      clicks,
      registrations,
      totalEarnings: earnings._sum.amount || 0,
    });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
