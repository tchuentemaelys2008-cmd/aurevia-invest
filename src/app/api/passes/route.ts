export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const defaultPasses = [
  { id: "aurevia-starter", name: "Aurevia Starter", price: 4000, dailyReturn: 10, duration: 120, color: "#3b6fd4", icon: "shield", description: "Ideal pour demarrer avec un revenu clair et simple." },
  { id: "aurevia-mini", name: "Aurevia Mini", price: 5000, dailyReturn: 10, duration: 120, color: "#3b6fd4", icon: "zap", description: "Un petit depot pour tester Aurevia et lancer vos revenus." },
  { id: "aurevia-boost", name: "Aurevia Boost", price: 8000, dailyReturn: 10, duration: 120, color: "#b87333", icon: "zap", description: "Un pack accessible pour accelerer vos premiers revenus." },
  { id: "aurevia-bronze", name: "Aurevia Bronze", price: 10000, dailyReturn: 10, duration: 120, color: "#b87333", icon: "zap", description: "Premier palier intermediaire avec revenu attractif." },
  { id: "aurevia-plus", name: "Aurevia Plus", price: 15000, dailyReturn: 10, duration: 120, color: "#6c4de6", icon: "star", description: "Un palier equilibre entre depot et revenu." },
  { id: "aurevia-silver", name: "Aurevia Silver", price: 25000, dailyReturn: 10, duration: 120, color: "#6c4de6", icon: "star", description: "Acces Silver avec meilleur suivi et priorite de support." },
  { id: "aurevia-gold", name: "Aurevia Gold", price: 50000, dailyReturn: 13, duration: 120, color: "#e6874d", icon: "trending-up", description: "Niveau Gold pour des objectifs plus ambitieux." },
  { id: "aurevia-platinum", name: "Aurevia Platinum", price: 75000, dailyReturn: 16, duration: 120, color: "#e6d44d", icon: "award", description: "Statut Platinum avec gains premium." },
  { id: "aurevia-vip", name: "Aurevia VIP", price: 100000, dailyReturn: 20, duration: 120, color: "#e6404d", icon: "crown", description: "Niveau ultime avec revenus maximum et support dedie." },
];

async function syncDefaultPasses() {
  await Promise.all(defaultPasses.map((pass) => prisma.pass.upsert({
    where: { id: pass.id },
    update: { ...pass, isActive: true },
    create: pass,
  })));
}

export async function GET() {
  try {
    const auth = await getAuthUser();
    if (!auth) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });

    await syncDefaultPasses();

    const [allPasses, userPasses] = await Promise.all([
      prisma.pass.findMany({ where: { isActive: true }, orderBy: { price: "asc" } }),
      prisma.userPass.findMany({ where: { userId: auth.userId }, include: { pass: true }, orderBy: { createdAt: "desc" } }),
    ]);

    return NextResponse.json({ passes: allPasses, userPasses });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
