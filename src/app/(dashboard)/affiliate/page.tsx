"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Copy, Share2, Users, MousePointer, TrendingUp } from "lucide-react";
import Card, { StatCard } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";

interface AffiliateData {
  referralCode: string;
  referralLink: string;
  clicks: number;
  registrations: number;
  totalEarnings: number;
}

const shareChannels = [
  { name: "WhatsApp", color: "#25D366", icon: "💬" },
  { name: "Telegram", color: "#0088cc", icon: "✈️" },
  { name: "Facebook", color: "#1877F2", icon: "📘" },
  { name: "Twitter", color: "#1DA1F2", icon: "🐦" },
];

export default function AffiliatePage() {
  const router = useRouter();
  const [data, setData] = useState<AffiliateData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/affiliate");
      if (res.status === 401) { router.push("/login"); return; }
      const json = await res.json();
      setData(json);
      setLoading(false);
    };
    load();
  }, [router]);

  const copyLink = async () => {
    if (!data) return;
    await navigator.clipboard.writeText(data.referralLink);
    toast.success("Lien copié !");
  };

  const shareVia = (channel: string) => {
    if (!data) return;
    const text = `Rejoignez Aurevia Invest et commencez à gagner dès aujourd'hui ! ${data.referralLink}`;
    const urls: Record<string, string> = {
      WhatsApp: `https://wa.me/?text=${encodeURIComponent(text)}`,
      Telegram: `https://t.me/share/url?url=${encodeURIComponent(data.referralLink)}&text=${encodeURIComponent("Rejoignez Aurevia Invest !")}`,
      Facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(data.referralLink)}`,
      Twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
    };
    if (urls[channel]) window.open(urls[channel], "_blank");
  };

  if (loading) return <div className="p-6 space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}</div>;
  if (!data) return null;

  return (
    <div className="max-w-xl mx-auto px-4 pt-8 pb-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <p className="text-white/40 text-sm mb-1">Parrainage</p>
        <h1 className="text-2xl font-display font-bold text-white">Mon lien d'affiliation</h1>
        <p className="text-white/40 text-sm mt-1">Invitez vos amis et gagnez des commissions à vie.</p>
      </motion.div>

      {/* Referral link */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="mb-5">
          <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Votre lien unique</p>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-white/4 border border-white/8 mb-3">
            <span className="text-xs text-white/60 flex-1 truncate font-mono-custom">{data.referralLink}</span>
            <button onClick={copyLink} className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#3b6fd4]/20 flex items-center justify-center text-[#3b6fd4] hover:bg-[#3b6fd4]/30 transition-colors">
              <Copy size={14} />
            </button>
          </div>
          <Button variant="primary" size="md" className="w-full" onClick={copyLink}>
            <Copy size={15} /> Copier le lien
          </Button>
        </Card>
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="grid grid-cols-3 gap-3 mb-5">
        <StatCard title="Clics" value={String(data.clicks)} icon={<MousePointer size={16} />} />
        <StatCard title="Inscrits" value={String(data.registrations)} icon={<Users size={16} />} />
        <StatCard title="Gains" value={formatCurrency(data.totalEarnings)} icon={<TrendingUp size={16} />} />
      </motion.div>

      {/* Commission info */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-5">
        <Card className="border-[#3b6fd4]/15">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3b6fd4] to-[#6c4de6] flex items-center justify-center">
              <Share2 size={18} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Commission 5%</p>
              <p className="text-xs text-white/40">Sur chaque investissement de vos filleuls</p>
            </div>
          </div>
          <p className="text-xs text-white/50">
            Vous gagnez <span className="text-emerald-400 font-semibold">5% de commission</span> sur chaque investissement réalisé par vos filleuls. Les commissions sont créditées instantanément.
          </p>
        </Card>
      </motion.div>

      {/* Share channels */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <p className="text-sm text-white/50 mb-3">Partager via</p>
        <div className="flex gap-3">
          {shareChannels.map((ch) => (
            <button key={ch.name} onClick={() => shareVia(ch.name)}
              className="flex flex-col items-center gap-1.5 flex-1 p-3 rounded-xl border border-white/8 bg-white/4 hover:bg-white/8 transition-colors">
              <span className="text-xl">{ch.icon}</span>
              <span className="text-[10px] text-white/50">{ch.name}</span>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
