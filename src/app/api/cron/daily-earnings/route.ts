import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export async function POST(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const now = new Date();
    const activePasses = await prisma.userPass.findMany({ where: { status: "ACTIVE", endDate: { gte: now } }, include: { pass: true } });
    let processed = 0;
    for (const up of activePasses) {
      const earning = parseFloat((Math.random() * 200).toFixed(2));
      await prisma.$transaction([
        prisma.user.update({ where: { id: up.userId }, data: { balance: { increment: earning }, totalEarnings: { increment: earning } } }),
        prisma.transaction.create({ data: { userId: up.userId, type: "DAILY_EARNING", amount: earning, description: "Revenu journalier - " + up.pass.name, status: "SUCCESS" } }),
        prisma.userPass.update({ where: { id: up.id }, data: { totalEarned: { increment: earning } } }),
      ]);
      processed++;
    }
    const expired = await prisma.userPass.updateMany({ where: { status: "ACTIVE", endDate: { lt: now } }, data: { status: "EXPIRED" } });
    return NextResponse.json({ success: true, processed, expired: expired.count });
  } catch (err) { console.error(err); return NextResponse.json({ error: "Erreur" }, { status: 500 }); }
}
