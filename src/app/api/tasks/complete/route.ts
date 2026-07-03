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
    if (!auth) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const body = await req.json();
    const { taskId } = schema.parse(body);

    const task = await prisma.dailyTask.findUnique({ where: { id: taskId } });
    if (!task || !task.isActive) return NextResponse.json({ error: "Tâche introuvable" }, { status: 404 });

    // completedAt est normalisé à minuit : la contrainte unique
    // (userId, taskId, completedAt) garantit "une fois par jour" au niveau
    // base de données, même face à des requêtes simultanées.
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const reward = DAILY_TASK_REWARD;
    try {
      await prisma.$transaction([
        prisma.userTask.create({ data: { userId: auth.userId, taskId, reward, completedAt: today } }),
        prisma.user.update({ where: { id: auth.userId }, data: { balance: { increment: reward }, totalEarnings: { increment: reward } } }),
        prisma.transaction.create({ data: { userId: auth.userId, type: "TASK_REWARD", amount: reward, description: `Tâche: ${task.title}`, status: "SUCCESS" } }),
      ]);
    } catch (e) {
      if (e && typeof e === "object" && "code" in e && (e as { code?: string }).code === "P2002") {
        return NextResponse.json({ error: "Tâche déjà complétée aujourd'hui" }, { status: 400 });
      }
      throw e;
    }

    return NextResponse.json({ success: true, reward });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
