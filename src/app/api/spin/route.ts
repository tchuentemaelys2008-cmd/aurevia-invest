export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { Prisma } from "@prisma/client";

const DEFAULT_SEGMENTS = [
  { label: "50 FCFA",   value: 50,   type: "money",      probability: 0.25, color: "#3b6fd4" },
  { label: "100 FCFA",  value: 100,  type: "money",      probability: 0.20, color: "#6c4de6" },
  { label: "200 FCFA",  value: 200,  type: "money",      probability: 0.15, color: "#10b981" },
  { label: "500 FCFA",  value: 500,  type: "money",      probability: 0.10, color: "#f59e0b" },
  { label: "1000 FCFA", value: 1000, type: "money",      probability: 0.05, color: "#ef4444" },
  { label: "Rien",      value: 0,    type: "empty",      probability: 0.15, color: "#374151" },
  { label: "Ã—2 demain", value: 2,    type: "multiplier", probability: 0.05, color: "#ec4899" },
  { label: "Rien",      value: 0,    type: "empty",      probability: 0.05, color: "#374151" },
];

export async function GET() {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: "Non authentifiÃ©" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: auth.userId }, select: { spinLastUsed: true } });
  const segments = await prisma.spinConfig.findMany({ where: { isActive: true } });
  const activeSegments = segments.length > 0 ? segments : DEFAULT_SEGMENTS;

  const now = new Date();
  const lastSpin = user?.spinLastUsed;
  const canSpin = !lastSpin || (now.getTime() - lastSpin.getTime()) > 24 * 60 * 60 * 1000;
  const nextSpin = lastSpin ? new Date(lastSpin.getTime() + 24 * 60 * 60 * 1000) : null;

  return NextResponse.json({ canSpin, nextSpin, segments: activeSegments });
}

export async function POST() {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: "Non authentifiÃ©" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: auth.userId }, select: { spinLastUsed: true } });
  const now = new Date();

  if (user?.spinLastUsed && (now.getTime() - user.spinLastUsed.getTime()) < 24 * 60 * 60 * 1000) {
    return NextResponse.json({ error: "Spin dÃ©jÃ  utilisÃ© aujourd'hui" }, { status: 400 });
  }

  const dbSegments = await prisma.spinConfig.findMany({ where: { isActive: true } });
  const segments = dbSegments.length > 0 ? dbSegments : DEFAULT_SEGMENTS;

  // Weighted random pick
  const rand = Math.random();
  let cumulative = 0;
  let result = segments[segments.length - 1];
  for (const seg of segments) {
    cumulative += seg.probability;
    if (rand <= cumulative) { result = seg; break; }
  }

  const ops: Prisma.PrismaPromise<unknown>[] = [
    prisma.user.update({ where: { id: auth.userId }, data: { spinLastUsed: now } }),
    prisma.spinResult.create({ data: { userId: auth.userId, label: result.label, value: result.value, type: result.type } }),
  ];

  if (result.type === "money" && result.value > 0) {
    ops.push(prisma.user.update({ where: { id: auth.userId }, data: { balance: { increment: result.value }, totalEarnings: { increment: result.value } } }));
    ops.push(prisma.transaction.create({ data: { userId: auth.userId, type: "TASK_REWARD", amount: result.value, description: "Spin quotidien", status: "SUCCESS" } }));
    ops.push(prisma.notification.create({ data: { userId: auth.userId, title: "Spin !", message: `Vous avez gagnÃ© ${result.value} FCFA avec le spin !`, type: "success" } }));
  }

  await prisma.$transaction(ops);

  return NextResponse.json({ result });
}
