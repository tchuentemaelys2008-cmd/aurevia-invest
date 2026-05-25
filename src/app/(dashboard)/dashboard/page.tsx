"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { TrendingUp, ShoppingBag, CheckSquare, ArrowUpRight, ArrowDownRight, Wallet, Bot, ShieldCheck, Gauge, Flame } from "lucide-react";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import Card, { StatCard } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import TelegramBanner from "@/components/ui/TelegramBanner";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";
import toast from "react-hot-toast";

interface DashboardData {
  user: { name: string; balance: number; totalEarnings: number; totalInvested: number; referralCode: string; level: number; xp: number; isVerified: boolean };
  activePasses: Array<{ id: string; pass: { name: string; dailyReturn: number }; status: string; endDate: string | null }>;
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
  const { t, lang } = useLanguage();
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

  const txTypeLabel: Record<string, string> = {
    PASS_PURCHASE: t("tx_PASS_PURCHASE"), DAILY_EARNING: t("tx_DAILY_EARNING"),
    TASK_REWARD: t("tx_TASK_REWARD"), AFFILIATE_COMMISSION: t("tx_AFFILIATE_COMMISSION"),
    WITHDRAWAL: t("tx_WITHDRAWAL"), REFERRAL_BONUS: t("tx_REFERRAL_BONUS"),
  };
  const { user, activePasses, recentTransactions, chartPoints } = data;
  const growthPct = user.totalInvested > 0 ? ((user.totalEarnings / user.totalInvested) * 100).toFixed(1) : "0";
  const xpProgress = Math.min(100, Math.round((user.xp % 1000) / 10));
  const trustScore = Math.min(98, 62 + activePasses.length * 9 + (user.isVerified ? 18 : 0));
  const smartCopy = activePasses.length
    ? formatCurrency(user.totalEarnings) + " " + t("dash_earned").toLowerCase() + " · " + (lang === "fr" ? "IA active, passes activés instantanément" : "IA active, passes activated instantly")
    : (lang === "fr" ? "Achetez un pass · activation instantanée" : "Buy a pass · instant activation");

  return (
    <div className="max-w-4xl mx-auto px-4 pt-8 pb-6 space-y-6">
      {/* Header */}
      <motion.div variants={fade} initial="hidden" animate="show" transition={{ duration: 0.4 }}
        className="flex items-start justify-between">
        <div>
          <p className="text-white/40 text-sm mb-1">{t("dash_label")}</p>
          <h1 className="text-2xl font-display font-bold text-white leading-tight">
            {t("dash_greeting")}<br />
            <span className="bg-gradient-to-r from-[#3b6fd4] to-[#a78bfa] bg-clip-text text-transparent">
              {user.name.split(" ")[0]}
            </span>
          </h1>
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
              <Button variant="secondary" size="md" className="w-full rounded-xl">
                <ArrowDownRight size={16} />
                <span>{t("dash_deposit")}</span>
              </Button>
            </Link>
            <Link href="/wallet">
              <Button variant="secondary" size="md" className="w-full rounded-xl">
                <Wallet size={16} />
                <span>{t("dash_withdraw")}</span>
              </Button>
            </Link>
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

      <motion.div variants={fade} initial="hidden" animate="show" transition={{ duration: 0.4, delay: 0.22 }}
        className="grid gap-3 sm:grid-cols-3">
        <Card className="relative overflow-hidden animate-float-soft">
          <div className="flex items-center gap-2 text-xs text-white/45 mb-3">
            <Gauge size={14} />
            <span>{lang === "fr" ? "Niveau" : "Level"} {user.level}</span>
          </div>
          <div className="h-2 rounded-full bg-white/8 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-[#3b6fd4] to-emerald-400" style={{ width: `${xpProgress}%` }} />
          </div>
          <p className="mt-2 text-xs text-white/35">{xpProgress}% XP</p>
          {user.level >= 3 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {user.level >= 3 && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-orange-400/10 text-orange-400 border border-orange-400/20 flex items-center gap-0.5">
                  <Flame size={8} /> Auto Money
                </span>
              )}
              {user.level >= 5 && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#6c4de6]/10 text-[#6c4de6] border border-[#6c4de6]/20 flex items-center gap-0.5">
                  <Bot size={8} /> IA Advisor
                </span>
              )}
            </div>
          )}
        </Card>
        <Card className="relative overflow-hidden">
          <div className="flex items-center gap-2 text-xs text-white/45 mb-2"><ShieldCheck size={14} /> Trust score</div>
          <p className="text-2xl font-display font-bold text-white">{trustScore}/100</p>
          <p className="text-xs text-emerald-400">{user.isVerified ? (lang === "fr" ? "Badge verifié" : "Verified badge") : (lang === "fr" ? "Vérification disponible" : "Account review ready")}</p>
        </Card>
        <Card className="relative overflow-hidden">
          <div className="flex items-center gap-2 text-xs text-white/45 mb-2"><Bot size={14} /> IA Advisor</div>
          <p className="text-xs text-white/75 leading-relaxed">{smartCopy}</p>
          {activePasses.length > 0 && (
            <span className="mt-2 inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">
              ● {lang === "fr" ? "Actif" : "Active"}
            </span>
          )}
        </Card>
      </motion.div>

      <motion.div variants={fade} initial="hidden" animate="show" transition={{ duration: 0.4, delay: 0.24 }}>
        <Card className="relative overflow-hidden shine-card">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold text-white"><Flame size={16} className="text-orange-400" /> {lang === "fr" ? "Mode argent auto" : "Auto Money Mode"}</p>
              <p className="mt-1 text-xs text-white/45">
                {lang === "fr"
                  ? "Auto-invest, bonus de dépôt, alertes anti-perte et progression visuelle ajustés selon vos passes actifs."
                  : "Auto-invest, deposit bonus, loss aversion alerts and visual progress tuned from your active passes."}
              </p>
            </div>
            <Link href="/passes">
              <Button variant="primary" size="sm">{t("dash_buy_pass")}</Button>
            </Link>
          </div>
        </Card>
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
                  <p className="text-xs text-white/40">
                    {up.status === "ACTIVE" && up.endDate
                      ? `${t("dash_expires")} ${formatDate(up.endDate)}`
                      : lang === "fr" ? "En attente d'activation" : "Awaiting activation"}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-emerald-400 font-bold text-sm">+{up.pass.dailyReturn}%</p>
                  <p className="text-xs font-semibold" style={{ color: "var(--control-text)", opacity: 0.5 }}>{t("passes_return")}</p>
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
            <p className="text-sm text-center py-6" style={{ color: "var(--control-text)", opacity: 0.4 }}>{t("dash_no_activity")}</p>
          ) : (
            recentTransactions.slice(0, 8).map((tx) => (
              <div key={tx.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${tx.amount > 0 ? "bg-emerald-400/10" : "bg-red-400/10"}`}>
                  {tx.amount > 0
                    ? <ArrowDownRight size={16} className="text-emerald-400" />
                    : <ArrowUpRight size={16} className="text-red-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: "var(--control-text)" }}>{txTypeLabel[tx.type] || tx.type}</p>
                  <p className="text-xs" style={{ color: "var(--control-text)", opacity: 0.35 }}>{formatDate(tx.createdAt)}</p>
                </div>
                <span className={`text-sm font-bold flex-shrink-0 ${tx.amount > 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {tx.amount > 0 ? "+" : "-"}{formatCurrency(Math.abs(tx.amount))}
                </span>
              </div>
            ))
          )}
        </Card>
      </motion.div>
      {/* TelegramBanner only on home */}
      <motion.div variants={fade} initial="hidden" animate="show" transition={{ duration: 0.4, delay: 0.35 }}>
        <TelegramBanner />
      </motion.div>
    </div>
  );
}
