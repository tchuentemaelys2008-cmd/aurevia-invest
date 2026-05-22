"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { TrendingUp, ShoppingBag, CheckSquare, ArrowUpRight, ArrowDownRight, Bell } from "lucide-react";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import Card, { StatCard } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import LangToggle from "@/components/ui/LangToggle";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";
import toast from "react-hot-toast";

interface DashboardData {
  user: { name: string; balance: number; totalEarnings: number; totalInvested: number; referralCode: string };
  activePasses: Array<{ id: string; pass: { name: string; dailyReturn: number }; status: string; endDate: string }>;
  recentTransactions: Array<{ id: string; type: string; amount: number; description: string; createdAt: string; status: string }>;
  chartPoints: Array<{ day: number; label: string; value: number }>;
}

// txTypeLabel is now built inside component using t()

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ value: number }> }) => {
  if (active && payload?.length) {
    return (
      <div className="glass-card rounded-xl px-3 py-2 text-xs">
        <span className="text-white font-semibold">{formatCurrency(payload[0].value)}</span>
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch("/api/dashboard");
        if (res.status === 401) { router.push("/login"); return; }
        const json = await res.json();
        setData(json);
      } catch {
        toast.error("Erreur de chargement");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [router]);

  const fade = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

  if (loading) return (
    <div className="p-6 space-y-4">
      {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
    </div>
  );

  if (!data) return null;

  const { t } = useLanguage();
  const txTypeLabel: Record<string, string> = {
    PASS_PURCHASE: t("tx_PASS_PURCHASE"), DAILY_EARNING: t("tx_DAILY_EARNING"),
    TASK_REWARD: t("tx_TASK_REWARD"), AFFILIATE_COMMISSION: t("tx_AFFILIATE_COMMISSION"),
    WITHDRAWAL: t("tx_WITHDRAWAL"), REFERRAL_BONUS: t("tx_REFERRAL_BONUS"),
  };
  const { user, activePasses, recentTransactions, chartPoints } = data;
  const growthPct = user.totalInvested > 0 ? ((user.totalEarnings / user.totalInvested) * 100).toFixed(1) : "0";

  return (
    <div className="max-w-4xl mx-auto px-4 pt-8 pb-6 space-y-6">
      {/* Header */}
      <motion.div variants={fade} initial="hidden" animate="show" transition={{ duration: 0.4 }}
        className="flex items-start justify-between">
        <div>
          <p className="text-white/40 text-sm mb-1">Dashboard</p>
          <h1 className="text-2xl font-display font-bold text-white leading-tight">
            {t("dash_greeting")}<br />
            <span className="bg-gradient-to-r from-[#3b6fd4] to-[#a78bfa] bg-clip-text text-transparent">
              {user.name.split(" ")[0]}
            </span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="lg:hidden"><LangToggle /></div>
          <Link href="/notifications" className="w-10 h-10 glass-card rounded-xl flex items-center justify-center relative">
            <Bell size={18} className="text-white/60" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full" />
          </Link>
        </div>
      </motion.div>

      {/* Balance Hero Card */}
      <motion.div variants={fade} initial="hidden" animate="show" transition={{ duration: 0.4, delay: 0.1 }}>
        <div className="relative rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#3b6fd4]/30 via-[#0c1428] to-[#6c4de6]/20" />
          <div className="absolute inset-0 border border-[#3b6fd4]/20 rounded-2xl" />
          <div className="relative p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-white/50 text-sm mb-2">{t("dash_balance")}</p>
                <p className="text-4xl font-display font-bold text-white">{formatCurrency(user.balance)}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-emerald-400 text-sm font-semibold flex items-center gap-1">
                    <TrendingUp size={14} />+{growthPct}%
                  </span>
                  <span className="text-white/30 text-xs">{t("dash_7days")}</span>
                </div>
              </div>
            </div>
            {/* Mini chart */}
            <div className="h-24 -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartPoints} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b6fd4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b6fd4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="label" hide />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="value" stroke="#3b6fd4" strokeWidth={2} fill="url(#blueGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </motion.div>

      {/* CTA Buttons */}
      <motion.div variants={fade} initial="hidden" animate="show" transition={{ duration: 0.4, delay: 0.15 }}
        className="grid grid-cols-2 gap-3">
        <Link href="/passes">
          <Button variant="primary" size="lg" className="w-full rounded-2xl py-4">
            <ShoppingBag size={18} />
            <span>{t("dash_buy_pass")}</span>
          </Button>
        </Link>
        <Link href="/tasks">
          <Button variant="secondary" size="lg" className="w-full rounded-2xl py-4">
            <CheckSquare size={18} />
            <span>{t("dash_daily_task")}</span>
          </Button>
        </Link>
      </motion.div>

      {/* Stats row */}
      <motion.div variants={fade} initial="hidden" animate="show" transition={{ duration: 0.4, delay: 0.2 }}
        className="grid grid-cols-2 gap-3">
        <StatCard title={t("dash_invested")} value={formatCurrency(user.totalInvested)} trend={parseFloat(growthPct)} />
        <StatCard title={t("dash_earned")} value={formatCurrency(user.totalEarnings)} sub={t("dash_since_start")} icon={<TrendingUp size={16} />} />
      </motion.div>

      {/* Active Passes */}
      <motion.div variants={fade} initial="hidden" animate="show" transition={{ duration: 0.4, delay: 0.25 }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-bold text-white">{t("dash_my_passes")}</h2>
          <Link href="/passes" className="text-xs text-[#3b6fd4] hover:text-blue-300 transition-colors">{t("dash_see_all")}</Link>
        </div>
        {activePasses.length === 0 ? (
          <Card className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-white/5 flex items-center justify-center">
              <ShoppingBag size={22} className="text-white/20" />
            </div>
            <p className="text-white/40 text-sm mb-3">{t("dash_no_pass")}</p>
            <Link href="/passes">
              <Button variant="primary" size="sm">{t("dash_discover")}</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-2">
            {activePasses.map((up) => (
              <Card key={up.id} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3b6fd4] to-[#6c4de6] flex items-center justify-center flex-shrink-0">
                  <ShoppingBag size={16} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm">{up.pass.name}</p>
                  <p className="text-xs text-white/40">{t("dash_expires")} {formatDate(up.endDate)}</p>
                </div>
                <div className="text-right">
                  <p className="text-emerald-400 font-bold text-sm">+{up.pass.dailyReturn}%</p>
                  <p className="text-xs text-white/30">/ jour</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </motion.div>

      {/* Recent activity */}
      <motion.div variants={fade} initial="hidden" animate="show" transition={{ duration: 0.4, delay: 0.3 }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-bold text-white">{t("dash_activity")}</h2>
          <Link href="/wallet" className="text-xs text-[#3b6fd4] hover:text-blue-300 transition-colors">{t("dash_see_all")}</Link>
        </div>
        <Card className="divide-y divide-white/5">
          {recentTransactions.length === 0 ? (
            <p className="text-white/40 text-sm text-center py-6">{t("dash_no_activity")}</p>
          ) : (
            recentTransactions.slice(0, 5).map((tx) => (
              <div key={tx.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${tx.amount > 0 ? "bg-emerald-400/10" : "bg-red-400/10"}`}>
                  {tx.amount > 0
                    ? <ArrowDownRight size={16} className="text-emerald-400" />
                    : <ArrowUpRight size={16} className="text-red-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">{txTypeLabel[tx.type] || tx.type}</p>
                  <p className="text-xs text-white/30">{formatDate(tx.createdAt)}</p>
                </div>
                <span className={`text-sm font-bold ${tx.amount > 0 ? "text-emerald-400" : "text-white/70"}`}>
                  {tx.amount > 0 ? "+" : ""}{formatCurrency(Math.abs(tx.amount))}
                </span>
              </div>
            ))
          )}
        </Card>
      </motion.div>
    </div>
  );
}
