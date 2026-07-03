export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "node:crypto";

// Compare secrets in constant time. Hash both sides first so the comparison
// works (and stays constant-time) even when lengths differ.
function safeEqual(a: string, b: string) {
  const ha = crypto.createHash("sha256").update(a).digest();
  const hb = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
}

function isAuthorized(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  // Fail closed: without a configured secret, nobody can trigger the cron
  // (before, a missing secret made "Bearer undefined" a valid credential).
  if (!secret) return false;
  const header = req.headers.get("authorization") || "";
  return safeEqual(header, `Bearer ${secret}`);
}

async function runDailyEarnings() {
  const now = new Date();
  // One credit per pass per UTC day: the unique transaction reference below
  // makes re-runs (retries, double invocations) no-ops instead of double pays.
  const dayKey = now.toISOString().slice(0, 10);

  const activePasses = await prisma.userPass.findMany({
    where: { status: "ACTIVE", endDate: { gte: now } },
    include: {
      pass: true,
      user: { select: { isVerified: true, isActive: true, isSuspended: true } },
    },
  });

  let processed = 0;
  let skipped = 0;
  for (const up of activePasses) {
    if (!up.user.isActive || up.user.isSuspended) { skipped++; continue; }

    // Verified users get a +10% bonus on daily pass earnings (verification perk).
    const base = (up.pass.price * up.pass.dailyReturn) / 100;
    const earning = parseFloat((base * (up.user.isVerified ? 1.1 : 1)).toFixed(2));
    const reference = `EARN-${up.id}-${dayKey}`;

    try {
      await prisma.$transaction([
        prisma.transaction.create({
          data: {
            userId: up.userId,
            type: "DAILY_EARNING",
            amount: earning,
            description: "Revenu journalier - " + up.pass.name,
            status: "SUCCESS",
            reference,
          },
        }),
        prisma.user.update({
          where: { id: up.userId },
          data: { balance: { increment: earning }, totalEarnings: { increment: earning } },
        }),
        prisma.userPass.update({
          where: { id: up.id },
          data: { totalEarned: { increment: earning } },
        }),
      ]);
      processed++;
    } catch (e) {
      // P2002 = unique constraint on reference → already credited today.
      if (e && typeof e === "object" && "code" in e && (e as { code?: string }).code === "P2002") {
        skipped++;
        continue;
      }
      throw e;
    }
  }

  const expired = await prisma.userPass.updateMany({
    where: { status: "ACTIVE", endDate: { lt: now } },
    data: { status: "EXPIRED" },
  });

  return { processed, skipped, expired: expired.count };
}

async function handle(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await runDailyEarnings();
    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    console.error("daily-earnings cron error:", err);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

// Vercel Cron invokes the endpoint with GET — this handler is what makes the
// scheduled job actually run. POST is kept for manual/external triggers.
export async function GET(req: NextRequest) {
  return handle(req);
}

export async function POST(req: NextRequest) {
  return handle(req);
}
