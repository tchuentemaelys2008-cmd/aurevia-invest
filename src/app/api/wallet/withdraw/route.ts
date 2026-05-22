import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  amount: z.number().min(2000, "Montant minimum: 2000 FCFA"),
  method: z.string().min(1),
  accountInfo: z.string().min(5),
});

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const body = await req.json();
    const data = schema.parse(body);

    const [user, hasPass, pending] = await Promise.all([
      prisma.user.findUnique({ where: { id: auth.userId }, select: { balance: true } }),
      prisma.userPass.count({ where: { userId: auth.userId, status: { in: ["ACTIVE", "EXPIRED"] } } }),
      prisma.withdrawal.count({ where: { userId: auth.userId, status: "PENDING" } }),
    ]);

    if (!hasPass) {
      return NextResponse.json({ error: "Vous devez acheter un pass avant de pouvoir retirer" }, { status: 403 });
    }
    if (!user || user.balance < data.amount) {
      return NextResponse.json({ error: "Solde insuffisant" }, { status: 400 });
    }
    if (pending >= 1) return NextResponse.json({ error: "Vous avez déjà une demande de retrait en attente" }, { status: 400 });

    await prisma.$transaction([
      prisma.withdrawal.create({
        data: { userId: auth.userId, amount: data.amount, method: data.method, accountInfo: data.accountInfo, status: "PENDING" },
      }),
      prisma.user.update({ where: { id: auth.userId }, data: { balance: { decrement: data.amount } } }),
      prisma.transaction.create({
        data: { userId: auth.userId, type: "WITHDRAWAL", amount: -data.amount, description: `Demande de retrait - ${data.method}`, status: "PENDING" },
      }),
    ]);

    return NextResponse.json({ success: true, message: "Demande de retrait soumise avec succès" });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
