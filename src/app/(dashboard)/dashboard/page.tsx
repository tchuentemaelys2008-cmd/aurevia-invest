"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { TrendingUp, ShoppingBag, CheckSquare, ArrowUpRight, ArrowDownRight, Wallet, Bot, ShieldCheck, Gauge, Flame, Eye, EyeOff, Plus, Users, History, BadgeCheck } from "lucide-react";
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
  const [hideBalance, setHideBalance] = useState(false);

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
      {/* Balance Hero Card — indigo, image-style (theme-proof colors via inline styles) */}
      <motion.div variants={fade} initial="hidden" animate="show" transition={{ duration: 0.4, delay: 0.05 }}>
        <div className="relative rounded-3xl overflow-hidden p-6"
          style={{ background: "linear-gradient(145deg, #3b6fd4 0%, #2d5bcc 58%, #1e3a8a 100%)", color: "#fff", boxShadow: "0 18px 40px rgba(59,111,212,0.35)" }}>
          {/* Soft ambient glows */}
          <div className="absolute -top-12 -right-10 w-44 h-44 rounded-full pointer-events-none" style={{ background: "rgba(255,255,255,0.14)", filter: "blur(40px)" }} />
          <div className="absolute -bottom-16 -left-8 w-44 h-44 rounded-full pointer-events-none" style={{ background: "rgba(255,255,255,0.10)", filter: "blur(40px)" }} />

          {/* Greeting */}
          <div className="relative flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-display font-bold flex-shrink-0" style={{ background: "rgba(255,255,255,0.22)", color: "#fff" }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.75)" }}>{t("dash_greeting")}</p>
                <p className="font-display font-bold leading-tight flex items-center gap-1.5" style={{ color: "#fff" }}>
                  {user.name.split(" ")[0]}
                  {user.isVerified && <ShieldCheck size={14} style={{ color: "#fff" }} />}
                </p>
              </div>
            </div>
          </div>

          {/* Balance */}
          <div className="relative flex items-center gap-2 mb-1">
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.75)" }}>{t("dash_balance")}</p>
            <button onClick={() => setHideBalance((v) => !v)} className="press" aria-label={hideBalance ? "Afficher le solde" : "Masquer le solde"} style={{ color: "rgba(255,255,255,0.7)" }}>
              {hideBalance ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          <p className="relative text-4xl font-display font-bold number-pop" style={{ color: "#fff" }}>
            {hideBalance ? "••••••••" : formatCurrency(user.balance)}
          </p>
          <p className="relative text-xs mt-1.5 font-mono-custom tracking-wider" style={{ color: "rgba(255,255,255,0.6)" }}>
            {lang === "fr" ? "Compte n°" : "Account no"} : •••• •••• {user.referralCode?.slice(-4).toUpperCase() || "0000"}
          </p>
          <div className="relative flex items-center gap-2 mt-2">
            <span className="flex items-center gap-1 text-xs font-semibold rounded-full px-2 py-0.5" style={{ background: "rgba(255,255,255,0.18)", color: "#fff" }}>
              <TrendingUp size={13} />+{growthPct}%
            </span>
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>{t("dash_7days")}</span>
          </div>

          {/* Subtle sparkline */}
          <div className="relative h-16 -mx-2 mt-3 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartPoints} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffffff" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" hide />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="value" stroke="#ffffff" strokeWidth={2} fill="url(#heroGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Action buttons inside the card */}
          <div className="relative grid grid-cols-2 gap-3">
            <Link href="/deposit">
              <button className="w-full flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold press" style={{ background: "#fff", color: "#3b6fd4" }}>
                <ArrowDownRight size={16} /> {t("dash_deposit")}
              </button>
            </Link>
            <Link href="/wallet">
              <button className="w-full flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold press" style={{ background: "rgba(255,255,255,0.18)", color: "#fff", border: "1px solid rgba(255,255,255,0.32)" }}>
                <Wallet size={16} /> {t("dash_withdraw")}
              </button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions — image style */}
      <motion.div variants={fade} initial="hidden" animate="show" transition={{ duration: 0.4, delay: 0.15 }}>
        <p className="font-display font-bold text-white mb-3">{lang === "fr" ? "Actions rapides" : "Quick Actions"}</p>
        <div className="grid grid-cols-4 gap-3">
          {[
            { href: "/passes", label: lang === "fr" ? "Investir" : "Invest", icon: Plus },
            { href: "/tasks", label: lang === "fr" ? "Tâches" : "Tasks", icon: CheckSquare },
            { href: "/affiliate", label: lang === "fr" ? "Parrainage" : "Refer", icon: Users },
            { href: "/history", label: lang === "fr" ? "Historique" : "History", icon: History },
          ].map((a) => (
            <Link key={a.href} href={a.href}>
              <div className="flex flex-col items-center gap-2 rounded-2xl py-4 px-1.5 press card-lift bg-[#3b6fd4]/10 border border-[#3b6fd4]/15">
                <div className="w-11 h-11 rounded-xl bg-[#3b6fd4]/15 flex items-center justify-center text-[#3b6fd4] flex-shrink-0">
                  <a.icon size={20} />
                </div>
                <span className="text-xs font-semibold text-white text-center leading-tight">{a.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Verification CTA (non-verified users) */}
      {!user.isVerified && (
        <motion.div variants={fade} initial="hidden" animate="show" transition={{ duration: 0.4, delay: 0.18 }}>
          <Link href="/verification">
            <div className="relative overflow-hidden rounded-2xl p-4 flex items-center gap-3 card-lift"
              style={{ background: "linear-gradient(135deg, rgba(59,111,212,0.18), rgba(45,91,204,0.12))", border: "1px solid rgba(59,111,212,0.25)" }}>
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#3b6fd4] to-[#2d5bcc] flex items-center justify-center text-white flex-shrink-0">
                <BadgeCheck size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-sm">{lang === "fr" ? "Devenez vérifié" : "Get verified"}</p>
                <p className="text-xs text-white/55">
                  {lang === "fr" ? "Retraits + rapides · +5% parrainage · +10% gains · 1000 FCFA" : "Faster withdrawals · +5% referral · +10% earnings · 1000 FCFA"}
                </p>
              </div>
              <span className="text-[#3b6fd4] flex-shrink-0">›</span>
            </div>
          </Link>
        </motion.div>
      )}

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
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#2d5bcc]/10 text-[#2d5bcc] border border-[#2d5bcc]/20 flex items-center gap-0.5">
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
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3b6fd4] to-[#2d5bcc] flex items-center justify-center flex-shrink-0">
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
