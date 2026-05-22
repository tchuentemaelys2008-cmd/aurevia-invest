"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Star, Zap, Shield, Crown, Check, X, Smartphone, CreditCard, Waves, TrendingUp, Award } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";

interface Pass {
  id: string;
  name: string;
  price: number;
  dailyReturn: number;
  duration: number;
  description: string;
  color: string;
  icon: string;
}
interface UserPass {
  id: string;
  passId: string;
  status: string;
  pass: Pass;
  endDate: string;
  totalEarned: number;
}

type PaymentMethod =
  | "FAPSHI"
  | "GENIUSPAY_ORANGE"
  | "GENIUSPAY_MTN"
  | "GENIUSPAY_WAVE"
  | "GENIUSPAY_MOOV"
  | "CARD"
  | "GENIUSPAY";

const iconMap: Record<string, React.ReactNode> = {
  shield: <Shield size={22} />,
  zap: <Zap size={22} />,
  star: <Star size={22} />,
  crown: <Crown size={22} />,
  "trending-up": <TrendingUp size={22} />,
  award: <Award size={22} />,
};

const colorMap: Record<string, { bg: string; border: string; glow: string }> = {
  "#3b6fd4": { bg: "from-[#3b6fd4] to-[#2d5bcc]",   border: "border-[#3b6fd4]/30", glow: "shadow-[0_0_30px_rgba(59,111,212,0.2)]"  },
  "#b87333": { bg: "from-[#b87333] to-[#a0621e]",   border: "border-[#b87333]/30", glow: "shadow-[0_0_30px_rgba(184,115,51,0.2)]"  },
  "#6c4de6": { bg: "from-[#6c4de6] to-[#5538d4]",   border: "border-[#6c4de6]/30", glow: "shadow-[0_0_30px_rgba(108,77,230,0.2)]"  },
  "#e6874d": { bg: "from-[#e6874d] to-[#d4703a]",   border: "border-[#e6874d]/30", glow: "shadow-[0_0_30px_rgba(230,135,77,0.2)]"  },
  "#e6d44d": { bg: "from-[#e6d44d] to-[#d4c13a]",   border: "border-[#e6d44d]/30", glow: "shadow-[0_0_30px_rgba(230,212,77,0.2)]"  },
  "#e6404d": { bg: "from-[#e6404d] to-[#cc2030]",   border: "border-[#e6404d]/30", glow: "shadow-[0_0_30px_rgba(230,64,77,0.25)]"  },
};

const PAYMENT_OPTIONS: {
  value: PaymentMethod;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  badge?: string;
  badgeColor?: string;
  requiresPhone?: boolean;
}[] = [
  {
    value: "GENIUSPAY_ORANGE",
    label: "Orange Money",
    sublabel: "CI, SN, CM, ML, CD...",
    icon: <Smartphone size={18} className="text-orange-400" />,
    badge: "GeniusPay",
    badgeColor: "bg-orange-400/10 text-orange-400",
    requiresPhone: true,
  },
  {
    value: "GENIUSPAY_MTN",
    label: "MTN Mobile Money",
    sublabel: "CI, CM, CG, RW, UG...",
    icon: <Smartphone size={18} className="text-yellow-400" />,
    badge: "GeniusPay",
    badgeColor: "bg-yellow-400/10 text-yellow-400",
    requiresPhone: true,
  },
  {
    value: "GENIUSPAY_WAVE",
    label: "Wave",
    sublabel: "Côte d'Ivoire, Sénégal",
    icon: <Waves size={18} className="text-sky-400" />,
    badge: "GeniusPay",
    badgeColor: "bg-sky-400/10 text-sky-400",
    requiresPhone: true,
  },
  {
    value: "GENIUSPAY_MOOV",
    label: "Moov Money",
    sublabel: "CI, TG, BF",
    icon: <Smartphone size={18} className="text-green-400" />,
    badge: "GeniusPay",
    badgeColor: "bg-green-400/10 text-green-400",
    requiresPhone: true,
  },
  {
    value: "FAPSHI",
    label: "FAPSHI Mobile Money",
    sublabel: "Mobile Money Cameroun",
    icon: <Smartphone size={18} className="text-[#3b6fd4]" />,
    requiresPhone: true,
  },
  {
    value: "CARD",
    label: "Carte bancaire",
    sublabel: "Visa, Mastercard — International",
    icon: <CreditCard size={18} className="text-purple-400" />,
    badge: "GeniusPay",
    badgeColor: "bg-purple-400/10 text-purple-400",
  },
  {
    value: "GENIUSPAY",
    label: "Choisir sur GeniusPay",
    sublabel: "Wave, Orange, MTN, Carte...",
    icon: <CreditCard size={18} className="text-[#3b6fd4]" />,
    badge: "Recommandé",
    badgeColor: "bg-[#3b6fd4]/10 text-[#3b6fd4]",
  },
];

export default function PassesPage() {
  const router = useRouter();
  const [passes, setPasses] = useState<Pass[]>([]);
  const [userPasses, setUserPasses] = useState<UserPass[]>([]);
  const [loading, setLoading] = useState(true);
  const [buyingPass, setBuyingPass] = useState<string | null>(null);
  const [selectedPass, setSelectedPass] = useState<Pass | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("GENIUSPAY");
  const [phone, setPhone] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/passes");
      if (res.status === 401) { router.push("/login"); return; }
      const data = await res.json();
      setPasses(data.passes || []);
      setUserPasses(data.userPasses || []);
      setLoading(false);
    };
    load();
  }, [router]);

  const handleBuy = async () => {
    if (!selectedPass) return;
    const option = PAYMENT_OPTIONS.find((o) => o.value === paymentMethod);
    if (option?.requiresPhone && !phone.trim()) {
      toast.error("Veuillez entrer votre numéro de téléphone");
      return;
    }
    setBuyingPass(selectedPass.id);
    setShowModal(false);
    try {
      const res = await fetch("/api/passes/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passId: selectedPass.id, paymentMethod, phoneNumber: phone || undefined }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Erreur lors de la commande"); setBuyingPass(null); return; }
      toast.success("Redirection vers le paiement...");
      // Internal path: router.push — external URL: window.location.href
      if (data.paymentUrl.startsWith("http")) {
        window.location.href = data.paymentUrl;
      } else {
        router.push(data.paymentUrl);
      }
    } catch {
      toast.error("Erreur lors de la commande");
      setBuyingPass(null);
    }
  };

  const selectedOption = PAYMENT_OPTIONS.find((o) => o.value === paymentMethod);

  if (loading) return (
    <div className="p-6 space-y-4">
      {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-40 rounded-2xl" />)}
    </div>
  );

  const ownedPassIds = userPasses.filter((up) => up.status === "ACTIVE").map((up) => up.passId);

  return (
    <div className="max-w-4xl mx-auto px-4 pt-8 pb-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <p className="text-white/40 text-sm mb-1">Investissements</p>
        <h1 className="text-2xl font-display font-bold text-white">Sélection des Passes</h1>
        <p className="text-white/40 text-sm mt-1">
          Choisissez le pass qui correspond à vos objectifs d'investissement.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {passes.map((pass, i) => {
          const colors = colorMap[pass.color] || colorMap["#3b6fd4"];
          const isOwned = ownedPassIds.includes(pass.id);
          const isPopular = pass.name.includes("Gold");
          return (
            <motion.div
              key={pass.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <div className={`relative rounded-2xl border ${colors.border} ${colors.glow} bg-[#0c1428] overflow-hidden`}>
                {isPopular && (
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-[#3b6fd4] to-[#6c4de6] text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                    POPULAIRE
                  </div>
                )}
                <div className="p-5">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors.bg} flex items-center justify-center text-white mb-4`}>
                    {iconMap[pass.icon] || <Star size={22} />}
                  </div>
                  <h3 className="font-display font-bold text-white text-lg mb-1">{pass.name}</h3>
                  <p className="text-white/40 text-xs mb-4">{pass.description}</p>
                  <div className="flex items-end gap-1 mb-4">
                    <span className="text-2xl font-display font-bold text-white">
                      {formatCurrency(pass.price)}
                    </span>
                  </div>
                  <div className="space-y-2 mb-5">
                    <div className="flex items-center gap-2 text-sm">
                      <Check size={14} className="text-emerald-400 flex-shrink-0" />
                      <span className="text-white/70">{pass.dailyReturn}% de retour / jour</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check size={14} className="text-emerald-400 flex-shrink-0" />
                      <span className="text-white/70">Durée: {pass.duration} jours</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check size={14} className="text-emerald-400 flex-shrink-0" />
                      <span className="text-white/70">
                        Gain total: {formatCurrency(pass.price * pass.dailyReturn * pass.duration / 100)}
                      </span>
                    </div>
                  </div>
                  {isOwned ? (
                    <div className="w-full py-2.5 rounded-xl bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 text-sm font-semibold text-center">
                      ✓ Actif
                    </div>
                  ) : (
                    <Button
                      variant="primary"
                      className="w-full"
                      onClick={() => { setSelectedPass(pass); setShowModal(true); }}
                    >
                      Acheter maintenant
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {userPasses.length > 0 && (
        <div>
          <h2 className="font-display font-bold text-white mb-3">Mes Passes actifs</h2>
          <div className="space-y-2">
            {userPasses.map((up) => (
              <Card key={up.id} className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorMap[up.pass.color]?.bg || "from-blue-500 to-purple-500"} flex items-center justify-center text-white flex-shrink-0`}>
                  {iconMap[up.pass.icon] || <Star size={16} />}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-white text-sm">{up.pass.name}</p>
                  <p className="text-xs text-white/40">
                    Expire: {new Date(up.endDate).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-xs font-bold px-2 py-0.5 rounded-full ${up.status === "ACTIVE" ? "text-emerald-400 bg-emerald-400/10" : "text-white/30 bg-white/5"}`}>
                    {up.status === "ACTIVE" ? "Actif" : up.status === "PENDING" ? "En attente" : "Expiré"}
                  </p>
                  <p className="text-xs text-white/40 mt-1">+{up.pass.dailyReturn}%/jour</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Buy Modal */}
      {showModal && selectedPass && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md bg-[#0c1428] border border-white/10 rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-bold text-white text-lg">Achat de Pass</h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-xl bg-white/6 flex items-center justify-center text-white/50 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-white/4 border border-white/8 mb-5">
              <div>
                <p className="font-bold text-white">{selectedPass.name}</p>
                <p className="text-xs text-white/40">
                  {selectedPass.dailyReturn}% / jour • {selectedPass.duration} jours
                </p>
              </div>
              <p className="text-xl font-display font-bold text-white">
                {formatCurrency(selectedPass.price)}
              </p>
            </div>

            <p className="text-sm text-white/60 mb-3 font-medium">Méthode de paiement</p>
            <div className="space-y-2 mb-5">
              {PAYMENT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setPaymentMethod(opt.value)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    paymentMethod === opt.value
                      ? "border-[#3b6fd4]/50 bg-[#3b6fd4]/10"
                      : "border-white/8 bg-white/4 hover:bg-white/6"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      paymentMethod === opt.value ? "border-[#3b6fd4]" : "border-white/20"
                    }`}
                  >
                    {paymentMethod === opt.value && (
                      <div className="w-2 h-2 bg-[#3b6fd4] rounded-full" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">{opt.icon}</div>
                  <div className="flex-1 text-left">
                    <span className="text-sm text-white font-medium block">{opt.label}</span>
                    <span className="text-xs text-white/40">{opt.sublabel}</span>
                  </div>
                  {opt.badge && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${opt.badgeColor}`}>
                      {opt.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {selectedOption?.requiresPhone && (
              <input
                placeholder="Numéro de téléphone (ex: +225 07 00 00 00 00)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 text-sm mb-5 focus:outline-none focus:border-[#3b6fd4]/50"
              />
            )}

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              loading={buyingPass === selectedPass.id}
              onClick={handleBuy}
            >
              Confirmer — {formatCurrency(selectedPass.price)}
            </Button>
            <p className="text-xs text-white/25 text-center mt-3">
              En cliquant sur confirmer, vous acceptez les Conditions d'utilisation
            </p>
          </motion.div>
        </div>
      )}
    </div>
  );
}
