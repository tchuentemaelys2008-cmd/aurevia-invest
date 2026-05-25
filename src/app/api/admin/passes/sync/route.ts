export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const PASS_CATALOG = [
  { id: "aurevia-2000",    name: "Aurevia 2000",    price: 2000,   dailyReturn: 6,  duration: 90, color: "#3b6fd4", icon: "zap",        description: "Decouvrez Aurevia avec un mini-depot et gagnez des la premiere semaine." },
  { id: "aurevia-starter", name: "Aurevia Starter", price: 4000,   dailyReturn: 10, duration: 90, color: "#3b6fd4", icon: "shield",     description: "Ideal pour demarrer avec un revenu clair et simple." },
  { id: "aurevia-mini",    name: "Aurevia Mini",    price: 5000,   dailyReturn: 10, duration: 90, color: "#3b6fd4", icon: "zap",        description: "Un petit depot pour tester Aurevia et lancer vos revenus." },
  { id: "aurevia-boost",   name: "Aurevia Boost",   price: 8000,   dailyReturn: 10, duration: 90, color: "#b87333", icon: "zap",        description: "Un pack accessible pour accelerer vos premiers revenus." },
  { id: "aurevia-bronze",  name: "Aurevia Bronze",  price: 10000,  dailyReturn: 10, duration: 90, color: "#b87333", icon: "zap",        description: "Premier palier intermediaire avec revenu attractif." },
  { id: "aurevia-plus",    name: "Aurevia Plus",    price: 15000,  dailyReturn: 10, duration: 90, color: "#6c4de6", icon: "star",       description: "Un palier equilibre entre depot et revenu." },
  { id: "aurevia-silver",  name: "Aurevia Silver",  price: 25000,  dailyReturn: 10, duration: 90, color: "#6c4de6", icon: "star",       description: "Acces Silver avec meilleur suivi et priorite de support." },
  { id: "aurevia-gold",    name: "Aurevia Gold",    price: 50000,  dailyReturn: 13, duration: 90, color: "#e6874d", icon: "trending-up",description: "Niveau Gold pour des objectifs plus ambitieux." },
  { id: "aurevia-platinum",name: "Aurevia Platinum",price: 75000,  dailyReturn: 16, duration: 90, color: "#e6d44d", icon: "award",      description: "Statut Platinum avec gains premium." },
  { id: "aurevia-vip",     name: "Aurevia VIP",     price: 100000, dailyReturn: 20, duration: 90, color: "#e6404d", icon: "crown",      description: "Niveau ultime avec revenus maximum et support dedie." },
];

export async function POST() {
  const auth = await getAuthUser();
  if (!auth || !["ADMIN", "SUPER_ADMIN"].includes(auth.role)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  let updated = 0;
  let created = 0;

  for (const pass of PASS_CATALOG) {
    const existing = await prisma.pass.findFirst({ where: { name: pass.name } });
    if (existing) {
      await prisma.pass.update({ where: { id: existing.id }, data: { duration: pass.duration, price: pass.price, dailyReturn: pass.dailyReturn } });
      updated++;
    } else {
      await prisma.pass.create({ data: pass });
      created++;
    }
  }

  return NextResponse.json({ success: true, updated, created, message: `${updated} passes mis à jour, ${created} créés.` });
}
