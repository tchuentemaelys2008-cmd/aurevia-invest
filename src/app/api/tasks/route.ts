export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DAILY_TASK_REWARD } from "@/lib/config";

// Tâches par défaut : créées automatiquement si la table est vide
const DEFAULT_TASKS = [
  { id: "task-login", title: "Se connecter", description: "Connectez-vous à votre compte", reward: 25, type: "LOGIN" },
  { id: "task-visit", title: "Visiter la page des passes", description: "Visitez la page des passes", reward: 25, type: "VISIT_PASSES" },
  { id: "task-share", title: "Partager avec 3 amis", description: "Partagez votre lien avec 3 amis", reward: 25, type: "SHARE" },
  { id: "task-social", title: "Suivre nos réseaux sociaux", description: "Suivez-nous sur les réseaux sociaux", reward: 25, type: "SOCIAL" },
  { id: "task-invite", title: "Inviter 1 ami", description: "Invitez un ami à rejoindre", reward: 25, type: "INVITE" },
];

export async function GET() {
  try {
    const auth = await getAuthUser();
    if (!auth) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let allTasks = await prisma.dailyTask.findMany({ where: { isActive: true } });

    // Si aucune tâche active, on crée les tâches par défaut puis on relit
    if (allTasks.length === 0) {
      for (const task of DEFAULT_TASKS) {
        await prisma.dailyTask.upsert({
          where: { id: task.id },
          update: { ...task, isActive: true },
          create: { ...task, isActive: true },
        });
      }
      allTasks = await prisma.dailyTask.findMany({ where: { isActive: true } });
    }

    const completedToday = await prisma.userTask.findMany({
      where: { userId: auth.userId, completedAt: { gte: today, lt: tomorrow } },
      include: { task: true },
    });

    const completedTaskIds = completedToday.map((ut) => ut.taskId);
    const totalTodayReward = completedToday.reduce((sum, ut) => sum + ut.reward, 0);

    // La récompense est fixée dans le code (DAILY_TASK_REWARD)
    const tasks = allTasks.map((t) => ({ ...t, reward: DAILY_TASK_REWARD }));

    return NextResponse.json({ tasks, completedTaskIds, totalTodayReward });
  } catch (err) {
    console.error("[api/tasks GET] error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
