"use client";
import { useEffect, useState } from "react";
import { Sparkles, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

interface Seg { id: string; label: string; value: number; type: string; probability: number; color: string; isActive: boolean; }

const EMPTY = { label: "", value: 0, type: "money", probability: 0.1, color: "#3b6fd4", isActive: true };

export default function AdminSpinPage() {
  const [segs, setSegs] = useState<Seg[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [showForm, setShowForm] = useState(false);

  const load = () => fetch("/api/admin/spin-config").then(r => r.json()).then(d => setSegs(d.segments || []));
  useEffect(() => { load(); }, []);

  const save = async () => {
    const res = await fetch("/api/admin/spin-config", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (res.ok) { toast.success("Segment ajouté"); setShowForm(false); setForm(EMPTY); load(); }
    else toast.error("Erreur");
  };

  const del = async (id: string) => {
    await fetch(`/api/admin/spin-config/${id}`, { method: "DELETE" });
    toast.success("Supprimé"); load();
  };

  const totalProb = segs.reduce((acc, s) => acc + s.probability, 0);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#f59e0b]/20 rounded-xl flex items-center justify-center"><Sparkles size={18} className="text-[#f59e0b]" /></div>
          <div>
            <h1 className="font-display font-bold text-white text-lg">Roue de la chance</h1>
            <p className="text-white/40 text-xs">Configuration des segments · Total prob: <span className={totalProb > 1.01 ? "text-red-400" : "text-[#10b981]"}>{(totalProb * 100).toFixed(0)}%</span></p>
          </div>
        </div>
        <button onClick={() => setShowForm(v => !v)} className="flex items-center gap-2 bg-[#f59e0b] text-black text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-all">
          <Plus size={15} /> Segment
        </button>
      </div>

      {showForm && (
        <div className="bg-[#0c1428] border border-white/10 rounded-2xl p-5 mb-6 grid grid-cols-3 gap-4">
          <div><label className="text-xs text-white/40 mb-1 block">Label</label><input value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none" /></div>
          <div><label className="text-xs text-white/40 mb-1 block">Valeur</label><input type="number" value={form.value} onChange={e => setForm(f => ({ ...f, value: Number(e.target.value) }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none" /></div>
          <div><label className="text-xs text-white/40 mb-1 block">Probabilité (0-1)</label><input type="number" min="0" max="1" step="0.01" value={form.probability} onChange={e => setForm(f => ({ ...f, probability: Number(e.target.value) }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none" /></div>
          <div><label className="text-xs text-white/40 mb-1 block">Type</label>
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none">
              <option value="money">money</option><option value="multiplier">multiplier</option><option value="empty">empty</option>
            </select>
          </div>
          <div><label className="text-xs text-white/40 mb-1 block">Couleur</label><input type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} className="w-full h-10 bg-white/5 border border-white/10 rounded-xl px-2 cursor-pointer" /></div>
          <div className="flex items-end gap-2">
            <button onClick={save} className="flex-1 bg-[#f59e0b] text-black text-sm font-semibold py-2.5 rounded-xl hover:opacity-90">Ajouter</button>
            <button onClick={() => setShowForm(false)} className="px-3 text-white/40 hover:text-white text-sm py-2.5">✕</button>
          </div>
        </div>
      )}

      <div className="bg-[#0c1428] border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-white/5 text-white/40 text-xs uppercase">
            <th className="px-4 py-3 text-left">Label</th><th className="px-4 py-3 text-left">Type</th><th className="px-4 py-3 text-right">Valeur</th><th className="px-4 py-3 text-right">Probabilité</th><th className="px-4 py-3 text-center">Couleur</th><th className="px-4 py-3 text-center">Action</th>
          </tr></thead>
          <tbody className="divide-y divide-white/5">
            {segs.map(s => (
              <tr key={s.id} className="hover:bg-white/2 transition-colors">
                <td className="px-4 py-3 font-medium text-white">{s.label}</td>
                <td className="px-4 py-3 text-white/40">{s.type}</td>
                <td className="px-4 py-3 text-right text-[#f59e0b] font-semibold">{s.value}</td>
                <td className="px-4 py-3 text-right text-white/60">{(s.probability * 100).toFixed(0)}%</td>
                <td className="px-4 py-3 text-center"><div className="w-5 h-5 rounded-full mx-auto border border-white/10" style={{ background: s.color }} /></td>
                <td className="px-4 py-3 text-center"><button onClick={() => del(s.id)} className="w-7 h-7 inline-flex items-center justify-center rounded-lg text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-all"><Trash2 size={13} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {segs.length === 0 && <p className="p-8 text-center text-white/30 text-sm">Aucun segment — segments par défaut actifs</p>}
      </div>
    </div>
  );
}
