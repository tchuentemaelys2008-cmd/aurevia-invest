export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  amount: z.number().int("Montant invalide").min(2000, "Montant minimum: 2000 FCFA").max(10_000_000, "Montant trop élevé"),
  method: z.string().min(1).max(50),
  accountInfo: z.string().min(5).max(200),
});

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const body = await req.json();
    const data = schema.parse(body);

    const [hasPass, pending] = await Promise.all([
      prisma.userPass.count({ where: { userId: auth.userId, status: { in: ["ACTIVE", "EXPIRED"] } } }),
      prisma.withdrawal.count({ where: { userId: auth.userId, status: "PENDING" } }),
    ]);

    if (!hasPass) {
      return NextResponse.json({ error: "Vous devez acheter un pass avant de pouvoir retirer" }, { status: 403 });
    }
    if (pending >= 1) return NextResponse.json({ error: "Vous avez déjà une demande de retrait en attente" }, { status: 400 });

    // The debit is conditional (balance >= amount) INSIDE the transaction, so
    // two concurrent requests can't both pass a pre-check and overdraw.
    const created = await prisma.$transaction(async (tx) => {
      const debited = await tx.user.updateMany({
        where: { id: auth.userId, balance: { gte: data.amount } },
        data: { balance: { decrement: data.amount } },
      });
      if (debited.count === 0) return false;
      await tx.withdrawal.create({
        data: { userId: auth.userId, amount: data.amount, method: data.method, accountInfo: data.accountInfo, status: "PENDING" },
      });
      await tx.transaction.create({
        data: { userId: auth.userId, type: "WITHDRAWAL", amount: -data.amount, description: `Demande de retrait - ${data.method}`, status: "PENDING" },
      });
      return true;
    });
    if (!created) return NextResponse.json({ error: "Solde insuffisant" }, { status: 400 });

    return NextResponse.json({ success: true, message: "Demande de retrait soumise avec succès" });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
