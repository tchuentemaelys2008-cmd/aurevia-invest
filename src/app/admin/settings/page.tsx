"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Save, CreditCard, Banknote } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import toast from "react-hot-toast";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    bank_account_name: "",
    bank_account_iban: "",
    bank_account_bic: "",
    bank_account_bank: "",
    bank_transfer_note: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.settings) setSettings((prev) => ({ ...prev, ...d.settings }));
        setLoading(false);
      });
  }, []);

  const save = async () => {
    setSaving(true);
    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    if (res.ok) toast.success("Paramètres sauvegardés");
    else toast.error("Erreur lors de la sauvegarde");
    setSaving(false);
  };

  if (loading) return (
    <div className="p-6 space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-12 rounded-xl" />)}</div>
  );

  return (
    <div className="p-4 lg:p-6 max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-xl font-display font-bold text-white">Paramètres</h1>
        <p className="text-white/40 text-sm">Configuration de la plateforme</p>
      </motion.div>

      <div className="bg-[#0c1428] rounded-2xl border border-white/8 p-5 space-y-5">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl bg-purple-400/10 flex items-center justify-center">
            <Banknote size={16} className="text-purple-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Virement bancaire (Europe)</p>
            <p className="text-xs text-white/40">Coordonnées bancaires affichées aux utilisateurs européens</p>
          </div>
        </div>

        <div className="space-y-3">
          <Input
            label="Nom du bénéficiaire"
            placeholder="Ex: Aurevia Invest SAS"
            value={settings.bank_account_name}
            onChange={(e) => setSettings({ ...settings, bank_account_name: e.target.value })}
            icon={<CreditCard size={14} />}
          />
          <Input
            label="IBAN"
            placeholder="Ex: FR76 3000 6000 0112 3456 7890 189"
            value={settings.bank_account_iban}
            onChange={(e) => setSettings({ ...settings, bank_account_iban: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="BIC / SWIFT"
              placeholder="Ex: BNPAFRPPXXX"
              value={settings.bank_account_bic}
              onChange={(e) => setSettings({ ...settings, bank_account_bic: e.target.value })}
            />
            <Input
              label="Banque"
              placeholder="Ex: BNP Paribas"
              value={settings.bank_account_bank}
              onChange={(e) => setSettings({ ...settings, bank_account_bank: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-white/70 mb-1.5 block">Note pour l'utilisateur</label>
            <textarea
              placeholder="Ex: Indiquez votre email en référence du virement..."
              value={settings.bank_transfer_note}
              onChange={(e) => setSettings({ ...settings, bank_transfer_note: e.target.value })}
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-[#3b6fd4]/50 resize-none"
            />
          </div>
        </div>

        <Button variant="primary" className="w-full" loading={saving} onClick={save}>
          <Save size={16} /> Sauvegarder les paramètres
        </Button>
      </div>
    </div>
  );
}
