"use client";
import { useEffect, useState } from "react";
import { Target, Plus, Trash2, ToggleLeft, ToggleRight, Pencil } from "lucide-react";
import toast from "react-hot-toast";

interface Mission { id: string; title: string; type: string; target: number; reward: number; isActive: boolean; period: string; _count: { userMissions: number }; }

const EMPTY = { title: "", titleEn: "", description: "", type: "invest", target: 10000, reward: 500, rewardType: "money", period: "all_time", isActive: true };

export default function AdminMissionsPage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = () => fetch("/api/admin/missions").then(r => r.json()).then(d => setMissions(d.missions || []));
  useEffect(() => { load(); }, []);

  const save = async () => {
    const url = editing ? `/api/admin/missions/${editing}` : "/api/admin/missions";
    const method = editing ? "PATCH" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (res.ok) { toast.success(editing ? "Mission mise à jour" : "Mission créée"); setShowForm(false); setEditing(null); setForm(EMPTY); load(); }
    else toast.error("Erreur");
  };

  const del = async (id: string) => {
    if (!confirm("Supprimer cette mission ?")) return;
    await fetch(`/api/admin/missions/${id}`, { method: "DELETE" });
    toast.success("Supprimée"); load();
  };

  const toggle = async (m: Mission) => {
    await fetch(`/api/admin/missions/${m.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !m.isActive }) });
    load();
  };

  const edit = (m: Mission) => {
    setForm({ title: m.title, titleEn: "", description: "", type: m.type, target: m.target, reward: m.reward, rewardType: "money", period: m.period, isActive: m.isActive });
    setEditing(m.id); setShowForm(true);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#3b6fd4]/20 rounded-xl flex items-center justify-center"><Target size={18} className="text-[#3b6fd4]" /></div>
          <div><h1 className="font-display font-bold text-white text-lg">Missions</h1><p className="text-white/40 text-xs">Gestion des missions</p></div>
        </div>
        <button onClick={() => { setShowForm(v => !v); setEditing(null); setForm(EMPTY); }} className="flex items-center gap-2 bg-[#3b6fd4] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-all">
          <Plus size={15} /> Nouvelle
        </button>
      </div>

      {showForm && (
        <div className="bg-[#0c1428] border border-white/10 rounded-2xl p-5 mb-6 grid grid-cols-2 gap-4">
          {[["Titre (FR)", "title", "text"], ["Titre (EN)", "titleEn", "text"], ["Description", "description", "text"], ["Type", "type", "select-type"], ["Cible", "target", "number"], ["Récompense (FCFA)", "reward", "number"], ["Période", "period", "select-period"]].map(([label, key, type]) => (
            <div key={key as string} className={key === "description" ? "col-span-2" : ""}>
              <label className="text-xs text-white/40 mb-1 block">{label}</label>
              {type === "select-type" ? (
                <select value={(form as Record<string,unknown>)[key as string] as string} onChange={e => setForm(f => ({ ...f, [key as string]: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none">
                  {["invest","invite","task","daily","weekly"].map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              ) : type === "select-period" ? (
                <select value={(form as Record<string,unknown>)[key as string] as string} onChange={e => setForm(f => ({ ...f, [key as string]: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none">
                  {["all_time","daily","weekly"].map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              ) : (
                <input type={type as string} value={(form as Record<string,unknown>)[key as string] as string | number} onChange={e => setForm(f => ({ ...f, [key as string]: type === "number" ? Number(e.target.value) : e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-[#3b6fd4]/50" />
              )}
            </div>
          ))}
          <div className="col-span-2 flex gap-3">
            <button onClick={save} className="flex-1 bg-[#3b6fd4] text-white text-sm font-semibold py-2.5 rounded-xl hover:opacity-90">{editing ? "Mettre à jour" : "Créer"}</button>
            <button onClick={() => { setShowForm(false); setEditing(null); }} className="px-4 text-white/40 hover:text-white text-sm">Annuler</button>
          </div>
        </div>
      )}

      <div className="bg-[#0c1428] border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-white/5 text-white/40 text-xs uppercase">
            <th className="px-4 py-3 text-left">Mission</th><th className="px-4 py-3 text-left">Type</th><th className="px-4 py-3 text-right">Cible</th><th className="px-4 py-3 text-right">Récompense</th><th className="px-4 py-3 text-right">Utilisateurs</th><th className="px-4 py-3 text-center">Statut</th><th className="px-4 py-3 text-center">Actions</th>
          </tr></thead>
          <tbody className="divide-y divide-white/5">
            {missions.map(m => (
              <tr key={m.id} className="hover:bg-white/2 transition-colors">
                <td className="px-4 py-3 font-medium text-white">{m.title}</td>
                <td className="px-4 py-3"><span className="text-xs bg-[#3b6fd4]/10 text-[#3b6fd4] px-2 py-0.5 rounded-full">{m.type}</span></td>
                <td className="px-4 py-3 text-right text-white/60">{m.target.toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-[#f59e0b] font-semibold">{m.reward.toLocaleString()} FCFA</td>
                <td className="px-4 py-3 text-right text-white/40">{m._count.userMissions}</td>
                <td className="px-4 py-3 text-center">
                  <button onClick={() => toggle(m)}>{m.isActive ? <ToggleRight className="text-[#10b981] mx-auto" size={22} /> : <ToggleLeft className="text-white/30 mx-auto" size={22} />}</button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => edit(m)} className="w-7 h-7 flex items-center justify-center rounded-lg text-white/30 hover:text-[#3b6fd4] hover:bg-[#3b6fd4]/10 transition-all"><Pencil size={13} /></button>
                    <button onClick={() => del(m.id)} className="w-7 h-7 flex items-center justify-center rounded-lg text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-all"><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {missions.length === 0 && <div className="p-10 text-center text-white/30 text-sm">Aucune mission</div>}
      </div>
    </div>
  );
}
