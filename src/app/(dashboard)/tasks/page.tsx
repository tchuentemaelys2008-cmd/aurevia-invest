"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Gift, LogIn, Eye, Share2, Users, UserPlus, Check, Clock, ExternalLink, ShieldCheck } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { formatCurrency, getTimeUntilMidnight } from "@/lib/utils";
import toast from "react-hot-toast";

interface Task { id: string; title: string; description: string; reward: number; type: string; }

// Tasks that require external action before verification
const EXTERNAL_TASKS: Record<string, { url: string; label: string }> = {
  SHARE:      { url: "/affiliate", label: "Aller à la page d'affiliation" },
  SOCIAL:     { url: "https://instagram.com", label: "Suivre sur Instagram" },
  INVITE:     { url: "/affiliate", label: "Inviter via le lien" },
  VISIT_PASSES:{ url: "/passes",  label: "Visiter les Passes" },
};

const taskIcons: Record<string, React.ReactNode> = {
  LOGIN:        <LogIn size={16} />,
  VISIT_PASSES: <Eye size={16} />,
  SHARE:        <Share2 size={16} />,
  SOCIAL:       <Users size={16} />,
  INVITE:       <UserPlus size={16} />,
};

export default function TasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [totalReward, setTotalReward] = useState(0);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState<string | null>(null);
  const [pendingVerify, setPendingVerify] = useState<string | null>(null);
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
    // Restore any pending verify from sessionStorage
    const saved = sessionStorage.getItem("pendingTaskVerify");
    if (saved) setPendingVerify(saved);
  }, [router]);

  useEffect(() => {
    const i = setInterval(() => setCountdown(getTimeUntilMidnight()), 1000);
    return () => clearInterval(i);
  }, []);

  const completeTask = useCallback(async (taskId: string) => {
    if (completedIds.includes(taskId)) return;
    setCompleting(taskId);
    try {
      const res = await fetch("/api/tasks/complete", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      setCompletedIds((prev) => [...prev, taskId]);
      setTotalReward((prev) => prev + data.reward);
      setPendingVerify(null);
      sessionStorage.removeItem("pendingTaskVerify");
      toast.success(`+${formatCurrency(data.reward)} crédité !`);
    } catch { toast.error("Erreur"); }
    finally { setCompleting(null); }
  }, [completedIds]);

  const handleAction = (task: Task) => {
    const ext = EXTERNAL_TASKS[task.type];
    if (!ext) { completeTask(task.id); return; }
    // Save that user left to do this task
    sessionStorage.setItem("pendingTaskVerify", task.id);
    setPendingVerify(task.id);
    if (ext.url.startsWith("http")) {
      window.open(ext.url, "_blank");
    } else {
      router.push(ext.url);
    }
  };

  if (loading) return <div className="p-4 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-16 rounded-2xl" />)}</div>;

  const allDone = tasks.length > 0 && tasks.every((t) => completedIds.includes(t.id));

  return (
    <div className="max-w-xl mx-auto px-4 pt-6 pb-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
        <p className="text-white/40 text-xs mb-0.5">Gains quotidiens</p>
        <h1 className="text-xl font-display font-bold text-white">Tâches du jour</h1>
      </motion.div>

      {/* Daily reward card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-4">
        <div className="rounded-2xl border border-[#3b6fd4]/20 bg-gradient-to-br from-[#3b6fd4]/10 to-[#6c4de6]/8 p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-white/50 text-xs uppercase tracking-wider mb-0.5">Récompense du jour</p>
              <p className="text-2xl font-display font-bold text-white">{formatCurrency(totalReward)}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#3b6fd4] to-[#6c4de6] flex items-center justify-center">
              <Gift size={20} className="text-white" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={13} className="text-white/40" />
            <span className="text-white/40 text-xs">Réinitialisation dans </span>
            <span className="font-mono text-white text-xs font-bold">
              {String(countdown.hours).padStart(2,"0")}:{String(countdown.minutes).padStart(2,"0")}:{String(countdown.seconds).padStart(2,"0")}
            </span>
          </div>
        </div>
      </motion.div>

      <div className="space-y-2">
        {tasks.map((task, i) => {
          const done = completedIds.includes(task.id);
          const ext = EXTERNAL_TASKS[task.type];
          const isPending = pendingVerify === task.id;
          return (
            <motion.div key={task.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.05 }}>
              <Card className={`flex items-center gap-3 py-3 px-3 ${done ? "opacity-55" : ""}`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${done ? "bg-emerald-400/15 text-emerald-400" : "bg-white/6 text-white/50"}`}>
                  {done ? <Check size={16} /> : (taskIcons[task.type] || <Gift size={16} />)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold leading-tight ${done ? "text-white/40 line-through" : "text-white"}`}>{task.title}</p>
                  <p className="text-xs text-white/30 truncate">{task.description}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs font-bold ${done ? "text-emerald-400/50" : "text-emerald-400"}`}>+{formatCurrency(task.reward)}</span>
                  {done ? (
                    <div className="w-7 h-7 rounded-xl bg-emerald-400/15 flex items-center justify-center"><Check size={13} className="text-emerald-400" /></div>
                  ) : isPending ? (
                    <Button size="sm" variant="primary" loading={completing === task.id}
                      onClick={() => completeTask(task.id)}
                      className="!px-2.5 !py-1 !rounded-xl text-xs gap-1">
                      <ShieldCheck size={12} /> Vérifier
                    </Button>
                  ) : ext ? (
                    <Button size="sm" variant="secondary"
                      onClick={() => handleAction(task)}
                      className="!px-2.5 !py-1 !rounded-xl text-xs gap-1">
                      <ExternalLink size={11} /> Faire
                    </Button>
                  ) : (
                    <Button size="sm" variant="secondary" loading={completing === task.id}
                      onClick={() => completeTask(task.id)}
                      className="!px-2.5 !py-1 !rounded-xl text-xs">
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
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-4 p-4 rounded-2xl bg-emerald-400/10 border border-emerald-400/20 text-center">
          <Check size={20} className="text-emerald-400 mx-auto mb-2" />
          <p className="text-emerald-400 font-bold text-sm">Toutes les tâches complétées !</p>
          <p className="text-white/40 text-xs mt-1">Revenez demain pour de nouvelles tâches</p>
        </motion.div>
      )}
    </div>
  );
}
