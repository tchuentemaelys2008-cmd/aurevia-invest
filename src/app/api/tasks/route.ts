import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const auth = await getAuthUser();
    if (!auth) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

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

    return NextResponse.json({ tasks: allTasks, completedTaskIds, totalTodayReward });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
