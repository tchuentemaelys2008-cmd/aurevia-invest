export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth) return NextResponse.json({ error: "Non authentifiÃ©" }, { status: 401 });

    const { passId, proofBase64, proofName } = await req.json();
    if (!passId || !proofBase64) return NextResponse.json({ error: "DonnÃ©es manquantes" }, { status: 400 });

    const pass = await prisma.pass.findUnique({ where: { id: passId } });
    if (!pass) return NextResponse.json({ error: "Pass introuvable" }, { status: 404 });

    const reference = `BANK-${nanoid(12).toUpperCase()}`;
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + pass.duration);

    await prisma.$transaction([
      prisma.payment.create({
        data: {
          userId: auth.userId,
          passId,
          amount: pass.price,
          provider: "BANK_TRANSFER",
          reference,
          status: "PENDING",
          metadata: { proofBase64, proofName, submittedAt: new Date().toISOString() },
        },
      }),
      prisma.userPass.create({
        data: { userId: auth.userId, passId, status: "PENDING", startDate, endDate, amountPaid: pass.price, paymentRef: reference },
      }),
    ]);

    return NextResponse.json({ success: true, reference });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
