import { prisma } from "@/lib/prisma";

// Verified users earn a higher referral rate (one of the verification perks).
export const REFERRAL_RATE = 0.10;
export const REFERRAL_RATE_VERIFIED = 0.15;

/**
 * Credits a confirmed DEPOSIT payment to the user's balance. Idempotent: a
 * payment already marked SUCCESS is left untouched. Used by the GeniusPay and
 * Fapshi webhooks (and the sandbox confirm route).
 */
export async function applyDepositSuccess(reference: string): Promise<boolean> {
  const payment = await prisma.payment.findUnique({ where: { reference } });
  if (!payment) return false;
  if (payment.status === "SUCCESS") return true;

  await prisma.$transaction([
    prisma.payment.update({ where: { reference }, data: { status: "SUCCESS" } }),
    prisma.user.update({ where: { id: payment.userId }, data: { balance: { increment: payment.amount } } }),
    prisma.transaction.create({
      data: { userId: payment.userId, type: "DEPOSIT", amount: payment.amount, description: "Recharge de solde", status: "SUCCESS", reference },
    }),
    prisma.notification.create({
      data: { userId: payment.userId, title: "Dépôt confirmé 💰", message: `Votre solde a été crédité de ${payment.amount} FCFA.`, type: "success" },
    }),
  ]);
  return true;
}

/**
 * Pays the referral commission for a buyer's investment. The rate is 15% when
 * the referrer is verified, otherwise 10%. No-op if the buyer has no referrer.
 */
export async function payReferralCommission(buyerId: string, amount: number): Promise<void> {
  const buyer = await prisma.user.findUnique({ where: { id: buyerId }, select: { referredById: true } });
  if (!buyer?.referredById) return;

  const referrer = await prisma.user.findUnique({ where: { id: buyer.referredById }, select: { isVerified: true } });
  const rate = referrer?.isVerified ? REFERRAL_RATE_VERIFIED : REFERRAL_RATE;
  const pct = Math.round(rate * 100);
  const commission = parseFloat((amount * rate).toFixed(2));

  await prisma.user.update({
    where: { id: buyer.referredById },
    data: { balance: { increment: commission }, totalEarnings: { increment: commission } },
  });
  await prisma.transaction.create({
    data: { userId: buyer.referredById, type: "REFERRAL_BONUS", amount: commission, description: `Commission parrainage ${pct}% — achat de pass`, status: "SUCCESS" },
  });
  await prisma.notification.create({
    data: { userId: buyer.referredById, title: "Commission de parrainage !", message: `Vous avez reçu ${commission} FCFA (${pct}%) grâce à votre filleul.`, type: "success" },
  });
}
