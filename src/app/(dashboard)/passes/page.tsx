"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Award, Check, ChevronLeft, Clock, CreditCard, Crown, Globe, Landmark, Shield, ShieldCheck, Smartphone, Star, TrendingUp, Upload, X, Zap } from "lucide-react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { TKey, useLanguage } from "@/lib/i18n";
import { formatCurrency } from "@/lib/utils";

interface Pass { id: string; name: string; price: number; dailyReturn: number; duration: number; description: string; color: string; icon: string; }
interface UserPass { id: string; passId: string; status: string; pass: Pass; endDate: string; totalEarned: number; }

const iconMap: Record<string, React.ReactNode> = {
  shield: <Shield size={20} />, zap: <Zap size={20} />, star: <Star size={20} />,
  crown: <Crown size={20} />, "trending-up": <TrendingUp size={20} />, award: <Award size={20} />,
};

const colorMap: Record<string, { bg: string; border: string; glow: string }> = {
  "#5b6ef5": { bg: "from-[#5b6ef5] to-[#2d5bcc]", border: "border-[#5b6ef5]/30", glow: "shadow-[0_0_20px_rgba(91,110,245,0.2)]" },
  "#b87333": { bg: "from-[#b87333] to-[#a0621e]", border: "border-[#b87333]/30", glow: "shadow-[0_0_20px_rgba(184,115,51,0.2)]" },
  "#6c5ce7": { bg: "from-[#6c5ce7] to-[#5538d4]", border: "border-[#6c5ce7]/30", glow: "shadow-[0_0_20px_rgba(108,92,231,0.2)]" },
  "#e6874d": { bg: "from-[#e6874d] to-[#d4703a]", border: "border-[#e6874d]/30", glow: "shadow-[0_0_20px_rgba(230,135,77,0.2)]" },
  "#e6d44d": { bg: "from-[#e6d44d] to-[#d4c13a]", border: "border-[#e6d44d]/30", glow: "shadow-[0_0_20px_rgba(230,212,77,0.2)]" },
  "#e6404d": { bg: "from-[#e6404d] to-[#cc2030]", border: "border-[#e6404d]/30", glow: "shadow-[0_0_20px_rgba(230,64,77,0.25)]" },
};

// Le client choisit simplement sa région. Le moyen de paiement précis (Orange,
// MTN, Wave, Moov, carte bancaire via Stripe…) est ensuite choisi sur la page
// sécurisée GeniusPay. Le Cameroun passe par FAPSHI (Mobile Money local).
const REGIONS = [
  { code: "CM", name: "Cameroun", nameEn: "Cameroon", rail: "FAPSHI" as const, icon: Smartphone, descFr: "MTN & Orange Money", descEn: "MTN & Orange Money" },
  { code: "AFRICA", name: "Afrique", nameEn: "Africa", rail: "GENIUSPAY" as const, icon: Globe, descFr: "Orange, MTN, Wave, Moov, carte", descEn: "Orange, MTN, Wave, Moov, card" },
  { code: "INTL", name: "International", nameEn: "International", rail: "GENIUSPAY" as const, icon: CreditCard, descFr: "Carte bancaire (Visa, Mastercard)", descEn: "Bank card (Visa, Mastercard)" },
];

type Step = "region" | "pay" | "bank";

export default function PassesPage() {
  const router = useRouter();
  const { lang, t } = useLanguage();
  const [passes, setPasses] = useState<Pass[]>([]);
  const [userPasses, setUserPasses] = useState<UserPass[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPass, setSelectedPass] = useState<Pass | null>(null);
  const [step, setStep] = useState<Step>("region");
  const [selectedRegion, setSelectedRegion] = useState<typeof REGIONS[0] | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [buying, setBuying] = useState(false);
  const [bankSettings, setBankSettings] = useState<Record<string, string>>({});
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofBase64, setProofBase64] = useState<string | null>(null);
  const [bankDone, setBankDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/passes").then((r) => r.json()),
      fetch("/api/admin/settings").then((r) => r.json()).catch(() => ({ settings: {} })),
    ]).then(([passData, settingsData]) => {
      setPasses(passData.passes || []);
      setUserPasses(passData.userPasses || []);
      setBankSettings(settingsData.settings || {});
      setLoading(false);
    });
  }, []);

  // Lock background scroll while the purchase modal is open so the
  // full-screen overlay always covers the viewport cleanly.
  useEffect(() => {
    const open = showModal || bankDone;
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [showModal, bankDone]);

  const passDescriptionKeys: Record<string, TKey> = {
    "Aurevia Starter": "pass_desc_starter",
    "Aurevia Mini": "pass_desc_mini",
    "Aurevia Boost": "pass_desc_boost",
    "Aurevia Bronze": "pass_desc_bronze",
    "Aurevia Plus": "pass_desc_plus",
    "Aurevia Silver": "pass_desc_silver",
    "Aurevia Gold": "pass_desc_gold",
    "Aurevia Platinum": "pass_desc_platinum",
    "Aurevia VIP": "pass_desc_vip",
  };

  const openModal = (pass: Pass) => {
    setSelectedPass(pass);
    setStep("region");
    setSelectedRegion(null);
    setPaymentMethod("");
    setProofFile(null);
    setProofBase64(null);
    setBankDone(false);
    setShowModal(true);
  };

  const selectRegion = (region: typeof REGIONS[0]) => {
    setSelectedRegion(region);
    setPaymentMethod(region.rail);
    setStep("pay");
  };

  const chooseBankTransfer = () => {
    setSelectedRegion(null);
    setPaymentMethod("BANK_TRANSFER");
    setStep("bank");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { toast.error("Image trop grande (max 3 Mo)"); return; }
    setProofFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setProofBase64(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleBuy = async () => {
    if (!selectedPass) return;
    setBuying(true);
    try {
      if (paymentMethod === "BANK_TRANSFER") {
        if (!proofBase64) { toast.error(t("passes_upload_proof")); setBuying(false); return; }
        const res = await fetch("/api/payments/bank-transfer", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ passId: selectedPass.id, proofBase64, proofName: proofFile?.name }),
        });
        if (res.ok) setBankDone(true);
        else { const d = await res.json(); toast.error(d.error || "Erreur"); }
        setBuying(false);
        return;
      }

      // GENIUSPAY (générique : la personne choisit son moyen sur la page
      // GeniusPay) ou FAPSHI (Cameroun). On redirige vers la page de paiement.
      setShowModal(false);
      const res = await fetch("/api/passes/buy", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passId: selectedPass.id, paymentMethod, country: selectedRegion?.code }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Erreur"); setShowModal(true); setBuying(false); return; }
      if (!data.paymentUrl) { toast.error("Aucune URL de paiement reçue"); setShowModal(true); setBuying(false); return; }
      toast.success("Redirection...");
      if (data.paymentUrl.startsWith("http")) window.location.href = data.paymentUrl;
      else router.push(data.paymentUrl);
    } catch {
      toast.error("Erreur");
    } finally {
      setBuying(false);
    }
  };

  if (loading) return <div className="p-4 space-y-3">{[...Array(6)].map((_, i) => <div key={i} className="skeleton h-36 rounded-2xl" />)}</div>;

  const ownedIds = userPasses.filter((up) => up.status === "ACTIVE").map((up) => up.passId);
  const describePass = (pass: Pass) => {
    const key = passDescriptionKeys[pass.name];
    return key ? t(key) : pass.description;
  };

  return (
    <div className="max-w-4xl mx-auto px-3 pt-5 pb-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
        <p className="text-white/40 text-xs mb-0.5">{t("passes_investments")}</p>
        <h1 className="text-xl font-display font-bold text-white">{t("passes_title")}</h1>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        {passes.map((pass, i) => {
          const colors = colorMap[pass.color] || colorMap["#5b6ef5"];
          const isOwned = ownedIds.includes(pass.id);
          const isPopular = pass.name.includes("Gold");
          return (
            <motion.div key={pass.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
              <div className={`relative rounded-2xl border ${colors.border} ${colors.glow} bg-[#0c1428] h-full card-lift cursor-pointer`}>
                {isPopular && (
                  <div className="absolute top-2 right-2 bg-gradient-to-r from-[#5b6ef5] to-[#6c5ce7] text-white text-[9px] font-bold px-2 py-0.5 rounded-full z-10">
                    {t("passes_popular")}
                  </div>
                )}
                <div className="p-4 flex flex-col h-full">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors.bg} flex items-center justify-center text-white mb-3`}>
                    {iconMap[pass.icon] || <Star size={20} />}
                  </div>
                  <h3 className="font-display font-bold text-white text-sm mb-0.5">{pass.name}</h3>
                  <p className="text-white/40 text-xs mb-3 leading-relaxed flex-1">{describePass(pass)}</p>
                  <div className="text-xl font-display font-bold text-white mb-3">{formatCurrency(pass.price)}</div>
                  <div className="space-y-1 mb-3">
                    <div className="flex items-center gap-1.5 text-xs">
                      <Check size={11} className="text-emerald-400 flex-shrink-0" />
                      <span className="text-white/60">{t("passes_return")}: {pass.dailyReturn}%</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs">
                      <Check size={11} className="text-emerald-400 flex-shrink-0" />
                      <span className="text-white/60">{pass.duration} {t("passes_days")}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs">
                      <Check size={11} className="text-emerald-400 flex-shrink-0" />
                      <span className="text-white/60">{t("passes_total_gain")} {formatCurrency(pass.price * pass.dailyReturn * pass.duration / 100)}</span>
                    </div>
                  </div>
                  {isOwned ? (
                    <div className="w-full py-2 rounded-xl bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 text-xs font-semibold text-center">
                      <Check size={11} className="inline mr-1" />{t("passes_active")}
                    </div>
                  ) : (
                    <Button variant="primary" className="w-full !py-2 text-xs" onClick={() => openModal(pass)}>
                      {t("passes_buy")}
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
          <h2 className="font-display font-bold text-white text-sm mb-2">{t("passes_my_passes")}</h2>
          <div className="space-y-2">
            {userPasses.map((up) => (
              <Card key={up.id} className="flex items-center gap-3 py-2.5">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${colorMap[up.pass.color]?.bg || "from-blue-500 to-purple-500"} flex items-center justify-center text-white flex-shrink-0`}>
                  {iconMap[up.pass.icon] || <Star size={16} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm">{up.pass.name}</p>
                  <p className="text-xs text-white/40">{t("dash_expires")} {new Date(up.endDate).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US")}</p>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${up.status === "ACTIVE" ? "text-emerald-400 bg-emerald-400/10" : "text-yellow-400 bg-yellow-400/10"}`}>
                  {up.status === "ACTIVE" ? t("passes_active") : up.status === "PENDING" ? t("passes_pending") : t("passes_expired")}
                </span>
              </Card>
            ))}
          </div>
        </div>
      )}

      {showModal && selectedPass && !bankDone && (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-3 bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-[#0c1428] border border-white/10 rounded-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/8 flex-shrink-0">
              <div className="flex items-center gap-2">
                {step !== "region" && (
                  <button onClick={() => setStep("region")} className="w-7 h-7 rounded-xl bg-white/6 flex items-center justify-center text-white/50 hover:text-white mr-1">
                    <ChevronLeft size={15} />
                  </button>
                )}
                <span className="font-display font-bold text-white text-sm">
                  {step === "region" ? (lang === "fr" ? "Choisissez votre région" : "Choose your region") : step === "pay" ? t("passes_payment") : t("passes_bank_transfer")}
                </span>
              </div>
              <button onClick={() => setShowModal(false)} className="w-7 h-7 rounded-xl bg-white/6 flex items-center justify-center text-white/50 hover:text-white">
                <X size={14} />
              </button>
            </div>

            <div className="px-5 py-3 border-b border-white/5 flex-shrink-0">
              <div className="flex items-center justify-between">
                <p className="text-white font-semibold text-sm">{selectedPass.name}</p>
                <p className="text-white font-display font-bold">{formatCurrency(selectedPass.price)}</p>
              </div>
              <p className="text-xs text-white/40">{t("passes_return")}: {selectedPass.dailyReturn}% - {selectedPass.duration} {t("passes_days")}</p>
            </div>

            <div className="overflow-y-auto flex-1">
              {step === "region" && (
                <div className="p-4 space-y-2">
                  {REGIONS.map((r) => (
                    <button key={r.code} onClick={() => selectRegion(r)} className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-white/8 bg-white/4 hover:bg-[#5b6ef5]/10 hover:border-[#5b6ef5]/30 transition-all text-left">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5b6ef5] to-[#6c5ce7] flex items-center justify-center text-white flex-shrink-0">
                        <r.icon size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-semibold">{lang === "en" ? r.nameEn : r.name}</p>
                        <p className="text-xs text-white/45 truncate">{lang === "en" ? r.descEn : r.descFr}</p>
                      </div>
                      <span className="text-white/30">›</span>
                    </button>
                  ))}

                  <button onClick={chooseBankTransfer} className="w-full flex items-center gap-2 justify-center pt-3 text-xs text-white/45 hover:text-white transition-colors">
                    <Landmark size={13} />
                    {lang === "fr" ? "Payer par virement bancaire (Europe)" : "Pay by bank transfer (Europe)"}
                  </button>
                </div>
              )}

              {step === "pay" && selectedRegion && (
                <div className="p-4 space-y-4">
                  <div className="rounded-2xl border border-[#5b6ef5]/25 bg-[#5b6ef5]/8 p-4">
                    <div className="flex items-center gap-2.5 mb-2">
                      <ShieldCheck size={18} className="text-[#5b6ef5]" />
                      <p className="text-sm font-semibold text-white">
                        {selectedRegion.rail === "FAPSHI"
                          ? (lang === "fr" ? "Mobile Money — FAPSHI" : "Mobile Money — FAPSHI")
                          : (lang === "fr" ? "Paiement sécurisé GeniusPay" : "Secure GeniusPay checkout")}
                      </p>
                    </div>
                    <p className="text-xs text-white/55 leading-relaxed">
                      {selectedRegion.rail === "FAPSHI"
                        ? (lang === "fr"
                          ? "Paiement MTN Mobile Money ou Orange Money (Cameroun). Vous finaliserez sur la page sécurisée."
                          : "Pay with MTN Mobile Money or Orange Money (Cameroon). You'll finish on the secure page.")
                        : (lang === "fr"
                          ? "Vous choisirez votre moyen de paiement (Orange, MTN, Wave, Moov ou carte bancaire) directement sur la page sécurisée GeniusPay."
                          : "You'll pick your payment method (Orange, MTN, Wave, Moov or bank card) right on the secure GeniusPay page.")}
                    </p>
                  </div>

                  <Button variant="primary" size="lg" className="w-full" loading={buying} onClick={handleBuy}>
                    {t("passes_confirm")} - {formatCurrency(selectedPass.price)}
                  </Button>
                  <p className="text-[11px] text-white/30 text-center flex items-center justify-center gap-1">
                    <Shield size={11} /> {lang === "fr" ? "Paiement 100% sécurisé · redirection automatique" : "100% secure payment · auto redirect"}
                  </p>
                </div>
              )}

              {step === "bank" && (
                <div className="p-4 space-y-4">
                  <div className="rounded-xl bg-purple-400/8 border border-purple-400/20 p-4 space-y-2.5">
                    <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider">{t("passes_bank_details")}</p>
                    {bankSettings.bank_account_name && <div><p className="text-xs text-white/40">{t("passes_beneficiary")}</p><p className="text-sm text-white font-medium">{bankSettings.bank_account_name}</p></div>}
                    {bankSettings.bank_account_iban && <div><p className="text-xs text-white/40">IBAN</p><p className="text-sm text-white font-mono">{bankSettings.bank_account_iban}</p></div>}
                    {bankSettings.bank_account_bic && (
                      <div className="grid grid-cols-2 gap-3">
                        <div><p className="text-xs text-white/40">BIC</p><p className="text-sm text-white font-mono">{bankSettings.bank_account_bic}</p></div>
                        {bankSettings.bank_account_bank && <div><p className="text-xs text-white/40">{t("passes_bank")}</p><p className="text-sm text-white">{bankSettings.bank_account_bank}</p></div>}
                      </div>
                    )}
                    <div className="pt-1 border-t border-purple-400/15">
                      <p className="text-xs font-bold text-white">{t("passes_exact_amount")} {formatCurrency(selectedPass.price)}</p>
                    </div>
                    {bankSettings.bank_transfer_note && <p className="text-xs text-white/50">{bankSettings.bank_transfer_note}</p>}
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-white mb-2">{t("passes_upload_proof")}</p>
                    <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    <button onClick={() => fileRef.current?.click()} className={`w-full border-2 border-dashed rounded-xl p-4 flex flex-col items-center gap-2 transition-colors ${proofFile ? "border-emerald-400/40 bg-emerald-400/5" : "border-white/15 hover:border-white/25"}`}>
                      {proofFile ? (
                        <><Check size={20} className="text-emerald-400" /><p className="text-xs text-emerald-400">{proofFile.name}</p></>
                      ) : (
                        <><Upload size={20} className="text-white/30" /><p className="text-xs text-white/40">{t("passes_upload_hint")}</p></>
                      )}
                    </button>
                    {proofBase64 && <img src={proofBase64} alt="preview" className="mt-2 rounded-xl max-h-32 object-cover w-full" />}
                  </div>

                  <Button variant="primary" size="lg" className="w-full" loading={buying} onClick={handleBuy} disabled={!proofFile}>
                    {t("passes_transfer_done")}
                  </Button>
                  <p className="text-xs text-white/30 text-center">{t("passes_activation_delay")}</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {bankDone && showModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm bg-[#0c1428] border border-white/10 rounded-2xl p-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-purple-400/10 flex items-center justify-center mx-auto mb-4">
              <Clock size={28} className="text-purple-400" />
            </div>
            <h3 className="font-display font-bold text-white text-lg mb-2">{t("passes_bank_received")}</h3>
            <p className="text-white/50 text-sm mb-6">{t("passes_bank_received_sub")}</p>
            <Button variant="primary" className="w-full" onClick={() => { setShowModal(false); router.push("/dashboard"); }}>
              {t("passes_back_dashboard")}
            </Button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
