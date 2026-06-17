"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Copy, MousePointer, TrendingUp, Users, Zap } from "lucide-react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import Card, { StatCard } from "@/components/ui/Card";
import { useLanguage } from "@/lib/i18n";
import { formatCurrency } from "@/lib/utils";

interface AffiliateData {
  referralCode: string;
  referralLink: string;
  clicks: number;
  registrations: number;
  totalEarnings: number;
}

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const TelegramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.820 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const shareChannels = [
  { name: "WhatsApp", icon: <WhatsAppIcon />, color: "text-[#25D366]", bg: "bg-[#25D366]/10 hover:bg-[#25D366]/20 border-[#25D366]/20" },
  { name: "Telegram", icon: <TelegramIcon />, color: "text-[#0088cc]", bg: "bg-[#0088cc]/10 hover:bg-[#0088cc]/20 border-[#0088cc]/20" },
  { name: "Facebook", icon: <FacebookIcon />, color: "text-[#1877F2]", bg: "bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border-[#1877F2]/20" },
  { name: "Twitter / X", icon: <TwitterIcon />, color: "text-white", bg: "bg-white/8 hover:bg-white/12 border-white/10" },
];

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07 } }) };

export default function AffiliatePage() {
  const router = useRouter();
  const { t, lang } = useLanguage();
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
    toast.success(t("affiliate_copy"));
  };

  const shareVia = (channel: string) => {
    if (!data) return;
    const text = `${t("affiliate_share_text")} ${data.referralLink}`;
    const urls: Record<string, string> = {
      WhatsApp: `https://wa.me/?text=${encodeURIComponent(text)}`,
      Telegram: `https://t.me/share/url?url=${encodeURIComponent(data.referralLink)}&text=${encodeURIComponent(t("affiliate_share_text"))}`,
      Facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(data.referralLink)}`,
      "Twitter / X": `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
    };
    if (urls[channel]) window.open(urls[channel], "_blank");
  };

  if (loading) return <div className="p-6 space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}</div>;
  if (!data) return null;

  return (
    <div className="max-w-xl mx-auto px-4 pt-8 pb-24">
      {/* Header */}
      <motion.div initial="hidden" animate="show" custom={0} variants={fadeUp} className="mb-6">
        <p className="text-[#e23744] text-xs font-semibold uppercase tracking-widest mb-1">{t("affiliate_kicker")}</p>
        <h1 className="text-2xl font-display font-bold" style={{ color: "var(--control-text)" }}>{t("affiliate_title")}</h1>
        <p className="text-sm mt-1" style={{ color: "var(--control-text)", opacity: 0.45 }}>{t("affiliate_sub")}</p>
      </motion.div>

      {/* Commission hero */}
      <motion.div initial="hidden" animate="show" custom={1} variants={fadeUp} className="mb-5">
        <div className="relative rounded-2xl overflow-hidden p-5" style={{ background: "linear-gradient(135deg, rgba(226,55,68,0.15), rgba(181,29,44,0.12))", border: "1px solid rgba(226,55,68,0.2)" }}>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#e23744] to-[#b51d2c] flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#e23744]/30">
              <span className="text-white font-display font-bold text-2xl">5%</span>
            </div>
            <div>
              <p className="font-display font-bold text-lg" style={{ color: "var(--control-text)" }}>{t("affiliate_commission_title")}</p>
              <p className="text-sm" style={{ color: "var(--control-text)", opacity: 0.55 }}>{t("affiliate_commission_sub")}</p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <Zap size={12} className="text-[#e23744]" />
                <span className="text-xs text-[#e23744] font-semibold">{lang === "fr" ? "Crédité instantanément" : "Instantly credited"}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div initial="hidden" animate="show" custom={2} variants={fadeUp} className="grid grid-cols-3 gap-3 mb-5">
        <StatCard title={t("affiliate_clicks")} value={String(data.clicks)} icon={<MousePointer size={16} />} />
        <StatCard title={t("affiliate_signups")} value={String(data.registrations)} icon={<Users size={16} />} />
        <StatCard title={t("affiliate_earnings")} value={formatCurrency(data.totalEarnings)} icon={<TrendingUp size={16} />} />
      </motion.div>

      {/* Link card */}
      <motion.div initial="hidden" animate="show" custom={3} variants={fadeUp} className="mb-5">
        <Card>
          <p className="text-xs uppercase tracking-wider mb-3 font-semibold" style={{ color: "var(--control-text)", opacity: 0.4 }}>{t("affiliate_link")}</p>
          <div className="flex items-center gap-2 p-3 rounded-xl mb-3" style={{ background: "var(--control-bg)", border: "1px solid var(--control-border)" }}>
            <span className="text-xs flex-1 truncate font-mono-custom" style={{ color: "var(--control-text)", opacity: 0.7 }}>{data.referralLink}</span>
            <button type="button" onClick={copyLink} className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#e23744]/20 flex items-center justify-center text-[#e23744] hover:bg-[#e23744]/30 transition-colors touch-manipulation">
              <Copy size={14} />
            </button>
          </div>
          <Button variant="primary" size="md" className="w-full" onClick={copyLink}>
            <Copy size={15} /> {t("affiliate_copy_btn")}
          </Button>
        </Card>
      </motion.div>

      {/* Commission info */}
      <motion.div initial="hidden" animate="show" custom={4} variants={fadeUp} className="mb-5">
        <Card>
          <p className="text-xs" style={{ color: "var(--control-text)", opacity: 0.5 }}>{t("affiliate_commission")}</p>
        </Card>
      </motion.div>

      {/* Share channels */}
      <motion.div initial="hidden" animate="show" custom={5} variants={fadeUp}>
        <p className="text-sm mb-3 font-semibold" style={{ color: "var(--control-text)", opacity: 0.5 }}>{t("affiliate_share")}</p>
        <div className="grid grid-cols-2 gap-3">
          {shareChannels.map((ch) => (
            <button
              type="button"
              key={ch.name}
              onClick={() => shareVia(ch.name)}
              className={`flex items-center gap-3 p-4 rounded-2xl border transition-all touch-manipulation ${ch.bg}`}
            >
              <span className={ch.color}>{ch.icon}</span>
              <span className="text-sm font-semibold" style={{ color: "var(--control-text)" }}>{ch.name}</span>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
