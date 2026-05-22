"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Gift, LogIn, Eye, Share2, Users, UserPlus, Check, Clock } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { formatCurrency, getTimeUntilMidnight } from "@/lib/utils";
import toast from "react-hot-toast";

interface Task { id: string; title: string; description: string; reward: number; type: string; }

const taskIcons: Record<string, React.ReactNode> = {
  LOGIN: <LogIn size={18} />,
  VISIT_PASSES: <Eye size={18} />,
  SHARE: <Share2 size={18} />,
  SOCIAL: <Users size={18} />,
  INVITE: <UserPlus size={18} />,
};

export default function TasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [totalReward, setTotalReward] = useState(0);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(getTimeUntilMidnight());

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/tasks");
      if (res.status === 401) { router.push("/login"); return; }
      const data = await res.json();
      setTasks(data.tasks || []);
      setCompletedIds(data.completedTaskIds || []);
      setTotalReward(data.totalTodayReward || 0);
      setLoading(false);
    };
    load();
  }, [router]);

  useEffect(() => {
    const interval = setInterval(() => setCountdown(getTimeUntilMidnight()), 1000);
    return () => clearInterval(interval);
  }, []);

  const completeTask = useCallback(async (taskId: string) => {
    if (completedIds.includes(taskId)) return;
    setCompleting(taskId);
    try {
      const res = await fetch("/api/tasks/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      setCompletedIds((prev) => [...prev, taskId]);
      setTotalReward((prev) => prev + data.reward);
      toast.success(`+${formatCurrency(data.reward)} crédité !`);
    } catch {
      toast.error("Erreur");
    } finally {
      setCompleting(null);
    }
  }, [completedIds]);

  if (loading) return <div className="p-6 space-y-4">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}</div>;

  const allDone = tasks.length > 0 && tasks.every((t) => completedIds.includes(t.id));

  return (
    <div className="max-w-xl mx-auto px-4 pt-8 pb-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <p className="text-white/40 text-sm mb-1">Gains quotidiens</p>
        <h1 className="text-2xl font-display font-bold text-white">Tâche quotidienne</h1>
        <p className="text-white/40 text-sm mt-1">Complétez les tâches quotidiennes et gagnez des récompenses.</p>
      </motion.div>

      {/* Daily reward card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-5">
        <div className="relative rounded-2xl overflow-hidden border border-[#3b6fd4]/20 bg-gradient-to-br from-[#3b6fd4]/15 to-[#6c4de6]/10 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white/50 text-xs uppercase tracking-wider mb-1">Récompense du jour</p>
              <p className="text-3xl font-display font-bold text-white">{formatCurrency(totalReward)}</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#3b6fd4] to-[#6c4de6] flex items-center justify-center">
              <Gift size={24} className="text-white" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-white/40" />
            <span className="text-white/40 text-xs">Réinitialisation dans: </span>
            <span className="font-mono-custom text-white text-xs font-bold">
              {String(countdown.hours).padStart(2, "0")} : {String(countdown.minutes).padStart(2, "0")} : {String(countdown.seconds).padStart(2, "0")}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Tasks list */}
      <div className="space-y-3">
        <h2 className="font-semibold text-white/60 text-xs uppercase tracking-wider mb-2">Tâches du jour</h2>
        {tasks.map((task, i) => {
          const done = completedIds.includes(task.id);
          return (
            <motion.div key={task.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.06 }}>
              <Card className={`flex items-center gap-4 ${done ? "opacity-60" : ""}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${done ? "bg-emerald-400/15 text-emerald-400" : "bg-white/6 text-white/50"}`}>
                  {done ? <Check size={18} /> : taskIcons[task.type] || <Gift size={18} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${done ? "text-white/40 line-through" : "text-white"}`}>{task.title}</p>
                  <p className="text-xs text-white/30 truncate">{task.description}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`text-sm font-bold ${done ? "text-emerald-400/50" : "text-emerald-400"}`}>
                    +{formatCurrency(task.reward)}
                  </span>
                  {done ? (
                    <div className="w-7 h-7 rounded-xl bg-emerald-400/15 flex items-center justify-center">
                      <Check size={14} className="text-emerald-400" />
                    </div>
                  ) : (
                    <Button size="sm" variant="secondary" loading={completing === task.id}
                      onClick={() => completeTask(task.id)}
                      className="!px-3 !py-1.5 !rounded-xl text-xs">
                      Faire
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {allDone && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-5 p-4 rounded-2xl bg-emerald-400/10 border border-emerald-400/20 text-center">
          <p className="text-emerald-400 font-bold">🎉 Toutes les tâches complétées !</p>
          <p className="text-white/50 text-sm mt-1">Revenez demain pour de nouvelles tâches</p>
        </motion.div>
      )}
    </div>
  );
}
