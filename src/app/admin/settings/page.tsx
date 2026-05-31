"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Save, CreditCard, Banknote, MessageCircle, Send, Link } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import toast from "react-hot-toast";

const fade = { hidden: { opacity: 0, y: 16 }, show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07 } }) };

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    bank_account_name: "",
    bank_account_iban: "",
    bank_account_bic: "",
    bank_account_bank: "",
    bank_transfer_note: "",
    whatsapp_link: "",
    telegram_link: "",
    whatsapp_group_link: "",
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
    if (res.ok) toast.success("Settings saved");
    else toast.error("Error saving settings");
    setSaving(false);
  };

  if (loading) return (
    <div className="p-6 space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-12 rounded-xl" />)}</div>
  );

  return (
    <div className="p-4 lg:p-6 max-w-2xl space-y-5">
      <motion.div initial="hidden" animate="show" custom={0} variants={fade} className="mb-2">
        <h1 className="text-xl font-display font-bold text-white">Platform Settings</h1>
        <p className="text-white/40 text-sm">Configure platform-wide options</p>
      </motion.div>

      {/* Community links */}
      <motion.div initial="hidden" animate="show" custom={1} variants={fade} className="bg-[#0c1428] rounded-2xl border border-white/8 p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-xl bg-green-400/10 flex items-center justify-center">
            <MessageCircle size={16} className="text-green-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Community Links</p>
            <p className="text-xs text-white/40">Links shown in the welcome popup after login</p>
          </div>
        </div>
        <Input
          label="WhatsApp Channel Link"
          placeholder="https://whatsapp.com/channel/..."
          value={settings.whatsapp_link}
          onChange={(e) => setSettings({ ...settings, whatsapp_link: e.target.value })}
          icon={<Link size={14} />}
        />
        <Input
          label="WhatsApp Group Link"
          placeholder="https://chat.whatsapp.com/..."
          value={settings.whatsapp_group_link}
          onChange={(e) => setSettings({ ...settings, whatsapp_group_link: e.target.value })}
          icon={<MessageCircle size={14} />}
        />
        <Input
          label="Telegram Channel Link"
          placeholder="https://t.me/..."
          value={settings.telegram_link}
          onChange={(e) => setSettings({ ...settings, telegram_link: e.target.value })}
          icon={<Send size={14} />}
        />
      </motion.div>

      {/* Bank settings */}
      <motion.div initial="hidden" animate="show" custom={2} variants={fade} className="bg-[#0c1428] rounded-2xl border border-white/8 p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-xl bg-purple-400/10 flex items-center justify-center">
            <Banknote size={16} className="text-purple-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Bank Transfer (Europe)</p>
            <p className="text-xs text-white/40">Bank details shown to European users</p>
          </div>
        </div>
        <Input
          label="Beneficiary name"
          placeholder="Aurevia Invest SAS"
          value={settings.bank_account_name}
          onChange={(e) => setSettings({ ...settings, bank_account_name: e.target.value })}
          icon={<CreditCard size={14} />}
        />
        <Input
          label="IBAN"
          placeholder="FR76 3000 6000 0112 3456 7890 189"
          value={settings.bank_account_iban}
          onChange={(e) => setSettings({ ...settings, bank_account_iban: e.target.value })}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="BIC / SWIFT"
            placeholder="BNPAFRPPXXX"
            value={settings.bank_account_bic}
            onChange={(e) => setSettings({ ...settings, bank_account_bic: e.target.value })}
          />
          <Input
            label="Bank name"
            placeholder="BNP Paribas"
            value={settings.bank_account_bank}
            onChange={(e) => setSettings({ ...settings, bank_account_bank: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-white/70 mb-1.5 block">Note for the user</label>
          <textarea
            placeholder="Include your email as the transfer reference..."
            value={settings.bank_transfer_note}
            onChange={(e) => setSettings({ ...settings, bank_transfer_note: e.target.value })}
            rows={3}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-[#5b6ef5]/50 resize-none"
          />
        </div>
      </motion.div>

      <motion.div initial="hidden" animate="show" custom={3} variants={fade}>
        <Button variant="primary" className="w-full" loading={saving} onClick={save}>
          <Save size={16} /> Save settings
        </Button>
      </motion.div>
    </div>
  );
}
