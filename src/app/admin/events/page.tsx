"use client";
import { useEffect, useState } from "react";
import { Zap, Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import toast from "react-hot-toast";

interface Event { id: string; title: string; type: string; value: number; isActive: boolean; endsAt: string | null; }

const EMPTY = { title: "", titleEn: "", description: "", type: "bonus", value: 0, isActive: true, showBanner: true, startsAt: "", endsAt: "" };

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [showForm, setShowForm] = useState(false);

  const load = () => fetch("/api/admin/events").then(r => r.json()).then(d => setEvents(d.events || []));
  useEffect(() => { load(); }, []);

  const save = async () => {
    const body = { ...form, startsAt: form.startsAt || undefined, endsAt: form.endsAt || undefined };
    const res = await fetch("/api/admin/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) { toast.success("Événement créé"); setShowForm(false); setForm(EMPTY); load(); }
    else toast.error("Erreur");
  };

  const del = async (id: string) => {
    if (!confirm("Supprimer cet événement ?")) return;
    await fetch(`/api/admin/events/${id}`, { method: "DELETE" });
    toast.success("Supprimé"); load();
  };

  const toggle = async (e: Event) => {
    await fetch(`/api/admin/events/${e.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !e.isActive }) });
    load();
  };

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const typeColors: Record<string, string> = { double_earnings: "#10b981", discount: "#f59e0b", bonus: "#2d5bcc", xp_boost: "#3b6fd4" };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#2d5bcc]/20 rounded-xl flex items-center justify-center"><Zap size={18} className="text-[#2d5bcc]" /></div>
          <div><h1 className="font-display font-bold text-white text-lg">Événements & Offres</h1><p className="text-white/40 text-xs">FOMO, bonus, double gains</p></div>
        </div>
        <button onClick={() => setShowForm(v => !v)} className="flex items-center gap-2 bg-[#2d5bcc] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-all">
          <Plus size={15} /> Créer
        </button>
      </div>

      {showForm && (
        <div className="bg-[#0c1428] border border-white/10 rounded-2xl p-5 mb-6 grid grid-cols-2 gap-4">
          {[["Titre (FR)", "title", "text"], ["Titre (EN)", "titleEn", "text"], ["Description", "description", "text"], ["Valeur (%)", "value", "number"], ["Début", "startsAt", "datetime-local"], ["Fin", "endsAt", "datetime-local"]].map(([label, key, type]) => (
            <div key={key as string} className={key === "description" ? "col-span-2" : ""}>
              <label className="text-xs text-white/40 mb-1 block">{label}</label>
              <input type={type as string} value={(form as Record<string,unknown>)[key as string] as string} onChange={e => set(key as string, type === "number" ? Number(e.target.value) : e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-[#2d5bcc]/50" />
            </div>
          ))}
          <div>
            <label className="text-xs text-white/40 mb-1 block">Type</label>
            <select value={form.type} onChange={e => set("type", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none">
              {["bonus","double_earnings","discount","xp_boost"].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div className="col-span-2 flex gap-3">
            <button onClick={save} className="flex-1 bg-[#2d5bcc] text-white text-sm font-semibold py-2.5 rounded-xl hover:opacity-90">Créer l'événement</button>
            <button onClick={() => setShowForm(false)} className="px-4 text-white/40 hover:text-white text-sm">Annuler</button>
          </div>
        </div>
      )}

      <div className="bg-[#0c1428] border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-white/5 text-white/40 text-xs uppercase">
            <th className="px-4 py-3 text-left">Titre</th><th className="px-4 py-3 text-left">Type</th><th className="px-4 py-3 text-right">Valeur</th><th className="px-4 py-3 text-left">Fin</th><th className="px-4 py-3 text-center">Actif</th><th className="px-4 py-3 text-center">Supprimer</th>
          </tr></thead>
          <tbody className="divide-y divide-white/5">
            {events.map(e => (
              <tr key={e.id} className="hover:bg-white/2 transition-colors">
                <td className="px-4 py-3 font-medium text-white">{e.title}</td>
                <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: `${typeColors[e.type]}20`, color: typeColors[e.type] || "#fff" }}>{e.type}</span></td>
                <td className="px-4 py-3 text-right text-[#f59e0b] font-semibold">{e.value}%</td>
                <td className="px-4 py-3 text-white/40 text-xs">{e.endsAt ? new Date(e.endsAt).toLocaleDateString() : "—"}</td>
                <td className="px-4 py-3 text-center"><button onClick={() => toggle(e)}>{e.isActive ? <ToggleRight className="text-[#10b981] mx-auto" size={22} /> : <ToggleLeft className="text-white/30 mx-auto" size={22} />}</button></td>
                <td className="px-4 py-3 text-center"><button onClick={() => del(e.id)} className="w-7 h-7 inline-flex items-center justify-center rounded-lg text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-all"><Trash2 size={13} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {events.length === 0 && <div className="p-10 text-center text-white/30 text-sm">Aucun événement</div>}
      </div>
    </div>
  );
}
