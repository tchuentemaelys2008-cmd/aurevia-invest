"use client";
import { useState } from "react";
import { Bell, Send, Globe, User } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminNotificationsPage() {
  const [form, setForm] = useState({ title: "", message: "", type: "info", targetUserId: "" });
  const [sending, setSending] = useState(false);
  const [mode, setMode] = useState<"global" | "targeted">("global");

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const send = async () => {
    if (!form.title || !form.message) { toast.error("Titre et message requis"); return; }
    setSending(true);
    const body = { ...form, targetUserId: mode === "targeted" ? form.targetUserId : undefined };
    const res = await fetch("/api/admin/notifications/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) { toast.success(mode === "global" ? "Notification envoyée à tous !" : "Notification envoyée"); setForm({ title: "", message: "", type: "info", targetUserId: "" }); }
    else { const d = await res.json(); toast.error(d.error || "Erreur"); }
    setSending(false);
  };

  return (
    <div className="p-6 max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 bg-[#3b6fd4]/20 rounded-xl flex items-center justify-center"><Bell size={18} className="text-[#3b6fd4]" /></div>
        <div><h1 className="font-display font-bold text-white text-lg">Notifications</h1><p className="text-white/40 text-xs">Envoyer des notifications</p></div>
      </div>

      <div className="bg-[#0c1428] border border-white/10 rounded-2xl p-5 space-y-5">
        {/* Mode toggle */}
        <div className="flex rounded-xl overflow-hidden border border-white/10">
          <button onClick={() => setMode("global")} className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-all ${mode === "global" ? "bg-[#3b6fd4] text-white" : "text-white/40 hover:text-white"}`}>
            <Globe size={15} /> Global
          </button>
          <button onClick={() => setMode("targeted")} className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-all ${mode === "targeted" ? "bg-[#3b6fd4] text-white" : "text-white/40 hover:text-white"}`}>
            <User size={15} /> Ciblé
          </button>
        </div>

        {mode === "targeted" && (
          <div>
            <label className="text-xs text-white/40 mb-1 block">ID Utilisateur</label>
            <input value={form.targetUserId} onChange={e => set("targetUserId", e.target.value)} placeholder="cuid de l'utilisateur"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#3b6fd4]/50" />
          </div>
        )}

        <div>
          <label className="text-xs text-white/40 mb-1 block">Titre</label>
          <input value={form.title} onChange={e => set("title", e.target.value)} placeholder="Titre de la notification"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#3b6fd4]/50" />
        </div>
        <div>
          <label className="text-xs text-white/40 mb-1 block">Message</label>
          <textarea value={form.message} onChange={e => set("message", e.target.value)} rows={3} placeholder="Contenu du message"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#3b6fd4]/50 resize-none" />
        </div>
        <div>
          <label className="text-xs text-white/40 mb-1 block">Type</label>
          <select value={form.type} onChange={e => set("type", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none">
            <option value="info">Info</option><option value="success">Succès</option><option value="warning">Avertissement</option><option value="error">Erreur</option>
          </select>
        </div>
        <button onClick={send} disabled={sending} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#3b6fd4] to-[#6c4de6] text-white font-semibold py-3 rounded-xl hover:opacity-90 disabled:opacity-50 transition-all">
          <Send size={16} /> {sending ? "Envoi..." : (mode === "global" ? "Envoyer à tous" : "Envoyer")}
        </button>
      </div>
    </div>
  );
}
