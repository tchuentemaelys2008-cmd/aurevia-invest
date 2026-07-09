import { prisma } from "@/lib/prisma";

// 1000 XP par niveau — le dashboard affiche la progression avec (xp % 1000) / 10.
export const XP_PER_LEVEL = 1000;

// Règle unique de gain d'XP : 10% du montant (FCFA) gagné ou investi,
// la même règle que celle déjà utilisée par les missions (reward * 0.1).
export function xpFromAmount(amount: number) {
  return parseFloat((amount * 0.1).toFixed(2));
}

export function levelForXp(xp: number) {
  return Math.max(1, Math.floor(xp / XP_PER_LEVEL) + 1);
}

// Recalcule le niveau à partir de l'XP courant. Appelé après chaque gain
// d'XP, hors transaction monétaire : un niveau en retard d'une requête n'a
// aucun impact financier et se rattrape au prochain gain.
export async function syncUserLevel(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { xp: true, level: true },
  });
  if (!user) return;
  const level = levelForXp(user.xp);
  if (level !== user.level) {
    await prisma.user.update({ where: { id: userId }, data: { level } });
  }
}
