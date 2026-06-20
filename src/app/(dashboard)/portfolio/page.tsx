"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Briefcase, TrendingUp } from "lucide-react";
import Card from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils";

interface UserPass {
  id: string;
  status: string;
  startDate: string;
  endDate: string;
  amountPaid: number;
  totalEarned: number;
  pass: { name: string; dailyReturn: number; duration: number; color: string };
}

export default function PortfolioPage() {
  const router = useRouter();
  const [userPasses, setUserPasses] = useState<UserPass[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/passes");
      if (res.status === 401) { router.push("/login"); return; }
      const data = await res.json();
      setUserPasses(data.userPasses || []);
      setLoading(false);
    };
    load();
  }, [router]);

  const totalInvested = userPasses.reduce((s, up) => s + up.amountPaid, 0);
  const totalEarned = userPasses.reduce((s, up) => s + up.totalEarned, 0);

  if (loading) return <div className="p-6 space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}</div>;

  return (
    <div className="max-w-xl mx-auto px-4 pt-8 pb-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <p className="text-white/40 text-sm mb-1">Investissements</p>
        <h1 className="text-2xl font-display font-bold text-white">Mon Portfolio</h1>
      </motion.div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card>
          <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Total investi</p>
          <p className="text-xl font-display font-bold text-white">{formatCurrency(totalInvested)}</p>
        </Card>
        <Card>
          <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Total gagné</p>
          <p className="text-xl font-display font-bold text-emerald-400">{formatCurrency(totalEarned)}</p>
        </Card>
      </div>

      {userPasses.length === 0 ? (
        <Card className="text-center py-12">
          <Briefcase size={32} className="mx-auto mb-3 text-white/20" />
          <p className="text-white/40">Aucun investissement actif</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {userPasses.map((up, i) => {
            const progress = up.startDate && up.endDate
              ? Math.min(100, ((Date.now() - new Date(up.startDate).getTime()) / (new Date(up.endDate).getTime() - new Date(up.startDate).getTime())) * 100)
              : 0;
            const daysLeft = up.endDate
              ? Math.max(0, Math.ceil((new Date(up.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
              : 0;

            return (
              <motion.div key={up.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <Card>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-display font-bold text-white">{up.pass.name}</p>
                      <p className="text-xs text-white/40 mt-0.5">{up.pass.dailyReturn}% / jour</p>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      up.status === "ACTIVE" ? "text-emerald-400 bg-emerald-400/10" :
                      up.status === "PENDING" ? "text-yellow-400 bg-yellow-400/10" :
                      "text-white/30 bg-white/5"}`}>
                      {up.status === "ACTIVE" ? "Actif" : up.status === "PENDING" ? "En attente" : "Expiré"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mb-3 text-sm">
                    <div className="flex-1">
                      <span className="text-white/40 text-xs">Investi: </span>
                      <span className="text-white font-semibold">{formatCurrency(up.amountPaid)}</span>
                    </div>
                    <div>
                      <span className="text-white/40 text-xs">Gagné: </span>
                      <span className="text-emerald-400 font-semibold">{formatCurrency(up.totalEarned)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-white/40 text-xs">
                      <TrendingUp size={12} />
                      {daysLeft}j restants
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#3b6fd4] to-[#2d5bcc] transition-all duration-500"
                      style={{ width: `${progress}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-white/30 mt-1">
                    <span>{new Date(up.startDate).toLocaleDateString("fr-FR")}</span>
                    <span>{new Date(up.endDate).toLocaleDateString("fr-FR")}</span>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
