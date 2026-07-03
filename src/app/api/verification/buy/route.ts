export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const BADGE_PRICE = 1000;

export async function POST() {
  try {
    const auth = await getAuthUser();
    if (!auth) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { balance: true, isVerified: true },
    });
    if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    if (user.isVerified) return NextResponse.json({ error: "Vous êtes déjà vérifié" }, { status: 400 });

    if (user.balance < BADGE_PRICE) {
      return NextResponse.json(
        { error: "Solde insuffisant", needTopUp: true, shortfall: BADGE_PRICE - user.balance },
        { status: 400 }
      );
    }

    // Débit conditionnel (solde suffisant ET pas déjà vérifié) dans la
    // transaction : pas de double achat ni de solde négatif en cas de requêtes
    // simultanées.
    const bought = await prisma.$transaction(async (tx) => {
      const debited = await tx.user.updateMany({
        where: { id: auth.userId, isVerified: false, balance: { gte: BADGE_PRICE } },
        data: { balance: { decrement: BADGE_PRICE }, isVerified: true },
      });
      if (debited.count === 0) return false;
      await tx.transaction.create({
        data: { userId: auth.userId, type: "VERIFICATION", amount: -BADGE_PRICE, description: "Badge de vérification", status: "SUCCESS" },
      });
      await tx.notification.create({
        data: { userId: auth.userId, title: "Compte vérifié ✅", message: "Félicitations ! Votre badge de vérification est actif : retraits prioritaires, support prioritaire, +5% de parrainage et +10% de gains journaliers.", type: "success" },
      });
      return true;
    });
    if (!bought) return NextResponse.json({ error: "Solde insuffisant ou déjà vérifié" }, { status: 400 });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Verification purchase error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
