export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { requireFullAdmin, logAdminAction } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET() {
  try {
    const auth = await requireFullAdmin();
    if (!auth) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const withdrawals = await prisma.withdrawal.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ withdrawals });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

const patchSchema = z.object({
  withdrawalId: z.string().min(1),
  status: z.enum(["APPROVED", "REJECTED", "PROCESSED"]),
  notes: z.string().max(500).optional(),
});

// Which transitions are allowed from each current status. PENDING is the only
// state a refund can start from, so a withdrawal can never be refunded twice.
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["APPROVED", "REJECTED", "PROCESSED"],
  APPROVED: ["PROCESSED", "REJECTED"],
};

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireFullAdmin();
    if (!auth) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const { withdrawalId, status, notes } = patchSchema.parse(await req.json());

    const result = await prisma.$transaction(async (tx) => {
      const withdrawal = await tx.withdrawal.findUnique({ where: { id: withdrawalId } });
      if (!withdrawal) return { error: "Retrait introuvable", code: 404 } as const;

      const allowed = ALLOWED_TRANSITIONS[withdrawal.status] || [];
      if (!allowed.includes(status)) {
        return { error: `Transition ${withdrawal.status} → ${status} non autorisée`, code: 400 } as const;
      }

      await tx.withdrawal.update({
        where: { id: withdrawalId },
        data: { status, notes, processedAt: new Date() },
      });

      // Refund exactly once: only a withdrawal that had debited the balance
      // (PENDING/APPROVED) and is now REJECTED gets its amount back.
      if (status === "REJECTED") {
        await tx.user.update({
          where: { id: withdrawal.userId },
          data: { balance: { increment: withdrawal.amount } },
        });
        await tx.transaction.create({
          data: { userId: withdrawal.userId, type: "WITHDRAWAL", amount: withdrawal.amount, description: "Retrait refusé - remboursement", status: "FAILED" },
        });
        await tx.notification.create({
          data: { userId: withdrawal.userId, title: "Retrait refusé", message: `Votre demande de retrait de ${withdrawal.amount} FCFA a été refusée. Le montant a été recrédité sur votre solde.`, type: "error" },
        });
      }
      return { ok: true, userId: withdrawal.userId, amount: withdrawal.amount } as const;
    });

    if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.code });

    await logAdminAction(auth, `WITHDRAWAL_${status}`, result.userId, { withdrawalId, amount: result.amount, notes }, req);
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
