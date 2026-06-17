"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Plus, Trash2, ToggleLeft, ToggleRight, X, Copy, Check, Users, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { useLanguage } from "@/lib/i18n";

interface Claim { id: string; user: { name: string; email: string }; claimedAt: string; }
interface GiftCode {
  id: string;
  code: string;
  description: string | null;
  value: number;
  maxWinners: number;
  isActive: boolean;
  createdAt: string;
  claims: Claim[];
}

const EMPTY = { code: "", description: "", value: 1000, maxWinners: 3, isActive: true };

// Build a random, readable code (no ambiguous chars) for the gift link.
function randomCode() {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let out = "AUR-";
  for (let i = 0; i < 6; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

export default function AdminGiftsPage() {
  const { lang } = useLanguage();
  const fr = lang === "fr";
  const [codes, setCodes] = useState<GiftCode[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [origin, setOrigin] = useState("");

  useEffect(() => { setOrigin(window.location.origin); }, []);
  const load = () => fetch("/api/admin/gift-codes").then(r => r.json()).then(d => setCodes(d.codes || []));
  useEffect(() => { load(); }, []);

  const openNew = () => { setForm({ ...EMPTY, code: randomCode() }); setShowForm(true); };
  const closeForm = () => setShowForm(false);

  const giftLink = (code: string) => `${origin}/gift/${code}`;

  const save = async () => {
    if (!form.code.trim()) { toast.error(fr ? "Code requis" : "Code required"); return; }
    if (!form.value || form.value <= 0) { toast.error(fr ? "Valeur invalide" : "Invalid value"); return; }
    setSaving(true);
    const res = await fetch("/api/admin/gift-codes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) { toast.success(fr ? "Cadeau créé !" : "Gift created!"); closeForm(); load(); }
    else { const d = await res.json().catch(() => ({})); toast.error(d.error || (fr ? "Erreur" : "Error")); }
  };

  const toggle = async (g: GiftCode) => {
    await fetch("/api/admin/gift-codes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: g.id, isActive: !g.isActive }),
    });
    load();
  };

  const del = async (g: GiftCode) => {
    if (!confirm(fr ? "Supprimer ce cadeau ?" : "Delete this gift?")) return;
    await fetch("/api/admin/gift-codes", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: g.id }),
    });
    toast.success(fr ? "Supprimé" : "Deleted"); load();
  };

  const copyLink = async (code: string) => {
    try {
      await navigator.clipboard.writeText(giftLink(code));
      setCopied(code);
      toast.success(fr ? "Lien copié !" : "Link copied!");
      setTimeout(() => setCopied(null), 1800);
    } catch { toast.error(fr ? "Copie impossible" : "Copy failed"); }
  };

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-[#e23744]/60 focus:bg-white/8 transition-colors placeholder:text-white/25";

  return (
    <div className="p-4 lg:p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#e23744]/20 rounded-xl flex items-center justify-center">
            <Gift size={18} className="text-[#e23744]" />
          </div>
          <div>
            <h1 className="font-display font-bold text-white text-lg">{fr ? "Cadeaux" : "Gifts"}</h1>
            <p className="text-white/40 text-xs">{codes.length} {fr ? "cadeau(x) configuré(s)" : "gift(s) configured"}</p>
          </div>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 bg-[#e23744] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-all">
          <Plus size={15} /> {fr ? "Nouveau cadeau" : "New gift"}
        </button>
      </div>

      {/* Create modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) closeForm(); }}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#0a1120] border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#e23744]/20 flex items-center justify-center">
                    <Sparkles size={15} className="text-[#e23744]" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">{fr ? "Nouveau cadeau" : "New gift"}</h2>
                    <p className="text-xs text-white/40">{fr ? "Génère un lien à partager" : "Generates a shareable link"}</p>
                  </div>
                </div>
                <button onClick={closeForm} className="w-8 h-8 flex items-center justify-center rounded-xl text-white/40 hover:text-white hover:bg-white/8 transition-all">
                  <X size={16} />
                </button>
              </div>

              <div className="px-6 py-5 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-white/40 mb-1.5 block uppercase tracking-wider">{fr ? "Code" : "Code"}</label>
                  <div className="flex gap-2">
                    <input className={inputCls + " font-mono tracking-widest"} value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} />
                    <button onClick={() => setForm(f => ({ ...f, code: randomCode() }))} className="px-3 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/20 text-xs whitespace-nowrap transition-all">
                      {fr ? "Aléatoire" : "Random"}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-white/40 mb-1.5 block uppercase tracking-wider">{fr ? "Valeur (FCFA)" : "Value (FCFA)"}</label>
                    <input type="number" className={inputCls} value={form.value} onChange={e => setForm(f => ({ ...f, value: Number(e.target.value) }))} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-white/40 mb-1.5 block uppercase tracking-wider">{fr ? "Gagnants max" : "Max winners"}</label>
                    <input type="number" className={inputCls} value={form.maxWinners} onChange={e => setForm(f => ({ ...f, maxWinners: Number(e.target.value) }))} />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-white/40 mb-1.5 block uppercase tracking-wider">{fr ? "Description (optionnel)" : "Description (optional)"}</label>
                  <input className={inputCls} placeholder={fr ? "Ex: Cadeau de bienvenue" : "Ex: Welcome gift"} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>

                <div className="flex items-center justify-between px-4 py-3 bg-white/4 rounded-xl border border-white/8">
                  <div>
                    <p className="text-sm font-medium text-white">{fr ? "Actif" : "Active"}</p>
                    <p className="text-xs text-white/40">{fr ? "Le lien fonctionne immédiatement" : "Link works immediately"}</p>
                  </div>
                  <button onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                    className={`w-10 h-6 rounded-full transition-colors relative ${form.isActive ? "bg-[#e23744]" : "bg-white/15"}`}>
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${form.isActive ? "translate-x-4" : "translate-x-0.5"}`} />
                  </button>
                </div>
              </div>

              <div className="px-6 pb-5 flex gap-3">
                <button onClick={closeForm} className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/50 hover:text-white hover:border-white/20 text-sm transition-all">
                  {fr ? "Annuler" : "Cancel"}
                </button>
                <button onClick={save} disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-[#e23744] hover:opacity-90 text-white text-sm font-semibold transition-all disabled:opacity-50">
                  {saving ? "…" : (fr ? "Créer le cadeau" : "Create gift")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List */}
      <div className="space-y-3">
        {codes.map(g => {
          const claimed = g.claims.length;
          const full = claimed >= g.maxWinners;
          return (
            <div key={g.id} className="bg-[#0c1428] border border-white/10 rounded-2xl p-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-white tracking-widest">{g.code}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${g.isActive ? "bg-emerald-400/10 text-emerald-400" : "bg-white/8 text-white/40"}`}>
                      {g.isActive ? (fr ? "Actif" : "Active") : (fr ? "Inactif" : "Inactive")}
                    </span>
                    {full && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-400/10 text-yellow-400">{fr ? "Complet" : "Full"}</span>}
                  </div>
                  {g.description && <p className="text-white/40 text-xs mt-1">{g.description}</p>}
                  <p className="text-[#e23744] font-display font-bold mt-1">{g.value.toLocaleString()} FCFA</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => toggle(g)} title={fr ? "Activer/Désactiver" : "Toggle"}>
                    {g.isActive ? <ToggleRight className="text-[#10b981]" size={26} /> : <ToggleLeft className="text-white/30" size={26} />}
                  </button>
                  <button onClick={() => del(g)} className="w-8 h-8 flex items-center justify-center rounded-lg text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-all">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Shareable link */}
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-white/4 border border-white/8 px-3 py-2">
                <span className="text-xs text-white/50 font-mono truncate flex-1">{giftLink(g.code)}</span>
                <button onClick={() => copyLink(g.code)} className="flex items-center gap-1.5 text-xs font-semibold text-[#e23744] hover:opacity-80 whitespace-nowrap">
                  {copied === g.code ? <><Check size={13} /> {fr ? "Copié" : "Copied"}</> : <><Copy size={13} /> {fr ? "Copier le lien" : "Copy link"}</>}
                </button>
              </div>

              {/* Claims */}
              <div className="mt-2 flex items-center gap-1.5 text-xs text-white/40">
                <Users size={12} />
                {claimed}/{g.maxWinners} {fr ? "réclamé(s)" : "claimed"}
                {claimed > 0 && (
                  <span className="text-white/30 truncate">— {g.claims.map(c => c.user.name).join(", ")}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {codes.length === 0 && (
        <div className="bg-[#0c1428] border border-white/10 rounded-2xl p-12 text-center">
          <Gift size={32} className="text-white/15 mx-auto mb-3" />
          <p className="text-white/30 text-sm">{fr ? "Aucun cadeau pour l'instant" : "No gifts yet"}</p>
          <p className="text-white/20 text-xs mt-1">{fr ? "Cliquez sur « Nouveau cadeau »" : 'Click "New gift" to start'}</p>
        </div>
      )}
    </div>
  );
}
