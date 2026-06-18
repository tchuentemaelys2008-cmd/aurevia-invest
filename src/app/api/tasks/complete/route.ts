export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DAILY_TASK_REWARD } from "@/lib/config";
import { z } from "zod";

const schema = z.object({ taskId: z.string() });

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth) return NextResponse.json({ error: "Non authentifiÃ©" }, { status: 401 });

    const body = await req.json();
    const { taskId } = schema.parse(body);

    const task = await prisma.dailyTask.findUnique({ where: { id: taskId } });
    if (!task || !task.isActive) return NextResponse.json({ error: "TÃ¢che introuvable" }, { status: 404 });

    // Check if already completed today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingCompletion = await prisma.userTask.findFirst({
      where: { userId: auth.userId, taskId, completedAt: { gte: today, lt: tomorrow } },
    });
    if (existingCompletion) return NextResponse.json({ error: "TÃ¢che dÃ©jÃ  complÃ©tÃ©e aujourd'hui" }, { status: 400 });

    // Create completion and award reward (fixed amount, enforced in code)
    const reward = DAILY_TASK_REWARD;
    await prisma.$transaction([
      prisma.userTask.create({ data: { userId: auth.userId, taskId, reward } }),
      prisma.user.update({ where: { id: auth.userId }, data: { balance: { increment: reward }, totalEarnings: { increment: reward } } }),
      prisma.transaction.create({ data: { userId: auth.userId, type: "TASK_REWARD", amount: reward, description: `TÃ¢che: ${task.title}`, status: "SUCCESS" } }),
    ]);

    return NextResponse.json({ success: true, reward });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
