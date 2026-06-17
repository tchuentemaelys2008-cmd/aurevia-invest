"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Globe, User, Phone, Save, Hash, Users, Crown } from "lucide-react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import LangToggle from "@/components/ui/LangToggle";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useLanguage } from "@/lib/i18n";

interface UserProfile { id: string; name: string; email: string; phone?: string; referralCode: string; }

const fade = { hidden: { opacity: 0, y: 14 }, show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08 } }) };

export default function SettingsPage() {
  const { t, lang } = useLanguage();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [form, setForm] = useState({ name: "", phone: "" });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [myTeamName, setMyTeamName] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(d => {
        if (d.user) {
          setProfile(d.user);
          setForm({ name: d.user.name || "", phone: d.user.phone || "" });
        }
        if (d.myTeamName) setMyTeamName(d.myTeamName);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const save = async () => {
    if (!form.name.trim()) { toast.error(lang === "fr" ? "Le nom est requis" : "Name is required"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, phone: form.phone }),
      });
      const data = await res.json();
      if (res.ok) {
        setProfile(p => p ? { ...p, ...data.user } : p);
        toast.success(lang === "fr" ? "Profil mis à jour" : "Profile updated");
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6 space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-16 rounded-2xl" />)}</div>;

  return (
    <div className="p-4 lg:p-8 max-w-xl mx-auto pb-24">
      <motion.div initial="hidden" animate="show" custom={0} variants={fade} className="mb-8">
        <p className="text-xs font-semibold text-[#e23744] uppercase tracking-widest mb-1">{lang === "fr" ? "Compte" : "Account"}</p>
        <h1 className="text-2xl font-display font-bold" style={{ color: "var(--control-text)" }}>{t("settings_title")}</h1>
      </motion.div>

      <div className="space-y-4">
        {/* Profile card */}
        <motion.div initial="hidden" animate="show" custom={1} variants={fade}>
          <div className="rounded-2xl overflow-hidden border" style={{ background: "var(--surface-card)", borderColor: "var(--control-border)" }}>
            <div className="px-5 py-3 border-b flex items-center gap-2" style={{ borderColor: "var(--control-border)" }}>
              <User size={15} className="text-[#e23744]" />
              <span className="text-sm font-semibold" style={{ color: "var(--control-text)" }}>
                {lang === "fr" ? "Mon profil" : "My profile"}
              </span>
            </div>
            <div className="px-5 py-4 space-y-4">
              {/* Email (read-only) */}
              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--control-text)", opacity: 0.5 }}>Email</label>
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm" style={{ background: "var(--control-bg)", border: "1px solid var(--control-border)", color: "var(--control-text)", opacity: 0.7 }}>
                  {profile?.email}
                </div>
              </div>

              {/* Referral code (read-only) */}
              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--control-text)", opacity: 0.5 }}>
                  <Hash size={11} className="inline mr-1" />{lang === "fr" ? "Code de parrainage" : "Referral code"}
                </label>
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-mono" style={{ background: "var(--control-bg)", border: "1px solid var(--control-border)", color: "var(--control-text)" }}>
                  {profile?.referralCode}
                </div>
              </div>

              {/* Name (editable) */}
              <Input
                label={lang === "fr" ? "Nom complet" : "Full name"}
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                icon={<User size={14} />}
                placeholder="Jean Dupont"
              />

              {/* Phone (editable) */}
              <Input
                label={lang === "fr" ? "Numéro de téléphone" : "Phone number"}
                type="tel"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                icon={<Phone size={14} />}
                placeholder="+237 6XX XXX XXX"
              />

              <Button variant="primary" className="w-full" loading={saving} onClick={save}>
                <Save size={15} /> {lang === "fr" ? "Sauvegarder" : "Save"}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Team */}
        <motion.div initial="hidden" animate="show" custom={2} variants={fade}>
          <div className="rounded-2xl overflow-hidden border" style={{ background: "var(--surface-card)", borderColor: "var(--control-border)" }}>
            <div className="px-5 py-3 border-b flex items-center gap-2" style={{ borderColor: "var(--control-border)" }}>
              <Users size={15} className="text-[#e23744]" />
              <span className="text-sm font-semibold" style={{ color: "var(--control-text)" }}>
                {lang === "fr" ? "Mon équipe" : "My team"}
              </span>
            </div>
            <div className="px-5 py-4 flex items-center justify-between gap-3">
              {myTeamName ? (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#e23744]/15 flex items-center justify-center flex-shrink-0">
                    <Crown size={14} className="text-[#e23744]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--control-text)" }}>{myTeamName}</p>
                    <p className="text-xs" style={{ color: "var(--control-text)", opacity: 0.4 }}>
                      {lang === "fr" ? "Membre actif" : "Active member"}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm" style={{ color: "var(--control-text)", opacity: 0.45 }}>
                  {lang === "fr" ? "Vous n'êtes dans aucune équipe." : "You are not in any team."}
                </p>
              )}
              <a href="/team" className="text-xs font-semibold text-[#e23744] bg-[#e23744]/10 hover:bg-[#e23744]/20 px-3 py-1.5 rounded-xl transition-all flex-shrink-0">
                {lang === "fr" ? "Voir les équipes" : "View teams"}
              </a>
            </div>
          </div>
        </motion.div>

        {/* Language */}
        <motion.div initial="hidden" animate="show" custom={3} variants={fade}>
          <div className="rounded-2xl overflow-hidden border" style={{ background: "var(--surface-card)", borderColor: "var(--control-border)" }}>
            <div className="px-5 py-3 border-b flex items-center gap-2" style={{ borderColor: "var(--control-border)" }}>
              <Globe size={15} className="text-[#e23744]" />
              <span className="text-sm font-semibold" style={{ color: "var(--control-text)" }}>{t("settings_language")}</span>
            </div>
            <div className="px-5 py-4 flex items-center justify-between">
              <p className="text-sm" style={{ color: "var(--control-text)", opacity: 0.55 }}>{t("settings_lang_desc")}</p>
              <LangToggle />
            </div>
          </div>
        </motion.div>

        {/* Theme */}
        <motion.div initial="hidden" animate="show" custom={4} variants={fade}>
          <div className="rounded-2xl overflow-hidden border" style={{ background: "var(--surface-card)", borderColor: "var(--control-border)" }}>
            <div className="px-5 py-3 border-b flex items-center gap-2" style={{ borderColor: "var(--control-border)" }}>
              <Globe size={15} className="text-[#b51d2c]" />
              <span className="text-sm font-semibold" style={{ color: "var(--control-text)" }}>
                {lang === "fr" ? "Apparence" : "Appearance"}
              </span>
            </div>
            <div className="px-5 py-4 flex items-center justify-between">
              <p className="text-sm" style={{ color: "var(--control-text)", opacity: 0.55 }}>
                {lang === "fr" ? "Choisissez le thème de l'interface." : "Choose the interface theme."}
              </p>
              <ThemeToggle />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
