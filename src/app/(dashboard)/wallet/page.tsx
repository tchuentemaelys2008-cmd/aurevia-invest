"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Wallet, ArrowUpRight, ArrowDownRight, X } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";
import toast from "react-hot-toast";

interface WalletData {
  wallet: { balance: number; totalEarnings: number; totalInvested: number };
  transactions: Array<{ id: string; type: string; amount: number; description: string; createdAt: string; status: string }>;
  withdrawals: Array<{ id: string; amount: number; method: string; status: string; createdAt: string }>;
  hasPass: boolean;
}

// txLabel built inside component

export default function WalletPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const txLabel: Record<string, string> = {
    PASS_PURCHASE: t("tx_PASS_PURCHASE"), DAILY_EARNING: t("tx_DAILY_EARNING"),
    TASK_REWARD: t("tx_TASK_REWARD"), AFFILIATE_COMMISSION: t("tx_AFFILIATE_COMMISSION"),
    WITHDRAWAL: t("tx_WITHDRAWAL"), REFERRAL_BONUS: t("tx_REFERRAL_BONUS"),
  };
  const [data, setData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("Mobile Money");
  const [accountInfo, setAccountInfo] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);

  const load = async () => {
    const res = await fetch("/api/wallet");
    if (res.status === 401) { router.push("/login"); return; }
    const json = await res.json();
    setData(json);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleWithdraw = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt < 2000) { toast.error(t("wallet_min_error")); return; }
    if (!accountInfo) { toast.error(t("wallet_account_error")); return; }
    setWithdrawing(true);
    try {
      const res = await fetch("/api/wallet/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amt, method, accountInfo }),
      });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error); return; }
      toast.success(t("wallet_success"));
      setShowWithdraw(false);
      setAmount("");
      setAccountInfo("");
      load();
    } catch {
      toast.error("Erreur");
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) return <div className="p-6 space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}</div>;
  if (!data) return null;

  return (
    <div className="max-w-xl mx-auto px-4 pt-8 pb-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <p className="text-white/40 text-sm mb-1">{t("wallet_finances")}</p>
        <h1 className="text-2xl font-display font-bold text-white">{t("wallet_title")}</h1>
      </motion.div>

      {/* Balance card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-5">
        <div className="relative rounded-2xl overflow-hidden border border-[#e23744]/20 bg-gradient-to-br from-[#e23744]/15 to-[#b51d2c]/10 p-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#e23744] to-[#b51d2c] flex items-center justify-center mb-4">
            <Wallet size={22} className="text-white" />
          </div>
          <p className="text-white/50 text-sm mb-1">{t("wallet_balance")}</p>
          <p className="text-4xl font-display font-bold text-white mb-4">{formatCurrency(data.wallet.balance)}</p>
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="p-3 rounded-xl bg-white/5">
              <p className="text-xs text-white/40 mb-1">{t("wallet_invested")}</p>
              <p className="font-bold text-white">{formatCurrency(data.wallet.totalInvested)}</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5">
              <p className="text-xs text-white/40 mb-1">{t("wallet_earned")}</p>
              <p className="font-bold text-emerald-400">{formatCurrency(data.wallet.totalEarnings)}</p>
            </div>
          </div>
          {data.hasPass ? (
            <Button variant="primary" className="w-full" onClick={() => setShowWithdraw(true)}>
              <ArrowUpRight size={16} /> {t("wallet_withdraw_btn")}
            </Button>
          ) : (
            <div className="w-full py-3 rounded-xl bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-sm text-center font-medium">
              {t("wallet_no_pass_msg")}
            </div>
          )}
        </div>
      </motion.div>

      {/* Transactions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h2 className="font-display font-bold text-white mb-3">{t("wallet_history")}</h2>
        <Card className="divide-y divide-white/5">
          {data.transactions.length === 0 ? (
            <p className="text-white/40 text-sm text-center py-6">{t("wallet_no_tx")}</p>
          ) : (
            data.transactions.map((tx) => (
              <div key={tx.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${tx.amount > 0 ? "bg-emerald-400/10" : "bg-red-400/10"}`}>
                  {tx.amount > 0 ? <ArrowDownRight size={16} className="text-emerald-400" /> : <ArrowUpRight size={16} className="text-red-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">{txLabel[tx.type] || tx.type}</p>
                  <p className="text-xs text-white/30">{formatDate(tx.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${tx.amount > 0 ? "text-emerald-400" : "text-white/70"}`}>
                    {tx.amount > 0 ? "+" : ""}{formatCurrency(Math.abs(tx.amount))}
                  </p>
                  <p className={`text-[10px] ${tx.status === "SUCCESS" ? "text-emerald-400/60" : tx.status === "PENDING" ? "text-yellow-400/60" : "text-red-400/60"}`}>
                    {tx.status}
                  </p>
                </div>
              </div>
            ))
          )}
        </Card>
      </motion.div>

      {/* Withdraw modal */}
      {showWithdraw && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-[#0c1428] border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-bold text-white text-lg">{t("wallet_modal_title")}</h3>
              <button onClick={() => setShowWithdraw(false)} className="w-8 h-8 rounded-xl bg-white/6 flex items-center justify-center text-white/50 hover:text-white">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-4 mb-5">
              <Input label={t("wallet_amount_label")} type="number" placeholder="2000" value={amount} onChange={(e) => setAmount(e.target.value)} />
              <div>
                <label className="text-sm font-medium text-white/70 mb-1.5 block">{t("wallet_method_label")}</label>
                <select value={method} onChange={(e) => setMethod(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#e23744]/50">
                  <option value="Mobile Money">Mobile Money</option>
                  <option value="Orange Money">Orange Money</option>
                  <option value="MTN MoMo">MTN MoMo</option>
                  <option value="Virement bancaire">Virement bancaire</option>
                </select>
              </div>
              <Input label={t("wallet_account_label")} placeholder={t("wallet_account_placeholder")} value={accountInfo} onChange={(e) => setAccountInfo(e.target.value)} />
            </div>
            <Button variant="primary" size="lg" className="w-full" loading={withdrawing} onClick={handleWithdraw}>
              {t("wallet_submit")}
            </Button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
