export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DAILY_TASK_REWARD } from "@/lib/config";

export async function GET() {
  try {
    const auth = await getAuthUser();
    if (!auth) return NextResponse.json({ error: "Non authentifiÃ©" }, { status: 401 });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [allTasks, completedToday] = await Promise.all([
      prisma.dailyTask.findMany({ where: { isActive: true } }),
      prisma.userTask.findMany({
        where: { userId: auth.userId, completedAt: { gte: today, lt: tomorrow } },
        include: { task: true },
      }),
    ]);

    const completedTaskIds = completedToday.map((ut) => ut.taskId);
    const totalTodayReward = completedToday.reduce((sum, ut) => sum + ut.reward, 0);

    // Reward is fixed in code (DAILY_TASK_REWARD) regardless of the stored value.
    const tasks = allTasks.map((t) => ({ ...t, reward: DAILY_TASK_REWARD }));

    return NextResponse.json({ tasks, completedTaskIds, totalTodayReward });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
