"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Plus, Trash2, ToggleLeft, ToggleRight, Pencil, X, Trophy } from "lucide-react";
import toast from "react-hot-toast";

interface Mission { id: string; title: string; type: string; target: number; reward: number; isActive: boolean; period: string; _count: { userMissions: number }; }

const EMPTY = { title: "", titleEn: "", description: "", descriptionEn: "", type: "invest", target: 10000, reward: 500, rewardType: "money", period: "all_time", isActive: true };

const TYPE_OPTIONS = [
  { value: "invest", label: "Invest" },
  { value: "invite", label: "Invite" },
  { value: "task", label: "Task" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
];

const PERIOD_OPTIONS = [
  { value: "all_time", label: "All time" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
];

export default function AdminMissionsPage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = () => fetch("/api/admin/missions").then(r => r.json()).then(d => setMissions(d.missions || []));
  useEffect(() => { load(); }, []);

  const openNew = () => { setForm(EMPTY); setEditing(null); setShowForm(true); };
  const openEdit = (m: Mission) => {
    setForm({ title: m.title, titleEn: "", description: "", descriptionEn: "", type: m.type, target: m.target, reward: m.reward, rewardType: "money", period: m.period, isActive: m.isActive });
    setEditing(m.id); setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditing(null); };

  const save = async () => {
    if (!form.title.trim()) { toast.error("Title (FR) is required"); return; }
    setSaving(true);
    const url = editing ? `/api/admin/missions/${editing}` : "/api/admin/missions";
    const method = editing ? "PATCH" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setSaving(false);
    if (res.ok) { toast.success(editing ? "Mission updated" : "Mission created"); closeForm(); load(); }
    else toast.error("Error saving mission");
  };

  const del = async (id: string) => {
    if (!confirm("Delete this mission?")) return;
    await fetch(`/api/admin/missions/${id}`, { method: "DELETE" });
    toast.success("Deleted"); load();
  };

  const toggle = async (m: Mission) => {
    await fetch(`/api/admin/missions/${m.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !m.isActive }) });
    load();
  };

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <label className="text-xs font-semibold text-white/40 mb-1.5 block uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-[#3b6fd4]/60 focus:bg-white/8 transition-colors placeholder:text-white/25";

  return (
    <div className="p-4 lg:p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#3b6fd4]/20 rounded-xl flex items-center justify-center">
            <Target size={18} className="text-[#3b6fd4]" />
          </div>
          <div>
            <h1 className="font-display font-bold text-white text-lg">Missions</h1>
            <p className="text-white/40 text-xs">{missions.length} mission{missions.length !== 1 ? "s" : ""} configured</p>
          </div>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 bg-[#3b6fd4] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-all">
          <Plus size={15} /> New mission
        </button>
      </div>

      {/* Modal overlay */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) closeForm(); }}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#0a1120] border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#3b6fd4]/20 flex items-center justify-center">
                    <Trophy size={15} className="text-[#3b6fd4]" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">{editing ? "Edit mission" : "New mission"}</h2>
                    <p className="text-xs text-white/40">Fill in the details below</p>
                  </div>
                </div>
                <button onClick={closeForm} className="w-8 h-8 flex items-center justify-center rounded-xl text-white/40 hover:text-white hover:bg-white/8 transition-all">
                  <X size={16} />
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Title (FR)">
                    <input className={inputCls} placeholder="Ex: Investir 10 000 FCFA" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                  </Field>
                  <Field label="Title (EN)">
                    <input className={inputCls} placeholder="Ex: Invest 10,000 FCFA" value={form.titleEn} onChange={e => setForm(f => ({ ...f, titleEn: e.target.value }))} />
                  </Field>
                </div>

                <Field label="Description (FR)">
                  <input className={inputCls} placeholder="Short description in French" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </Field>
                <Field label="Description (EN)">
                  <input className={inputCls} placeholder="Short description in English" value={form.descriptionEn} onChange={e => setForm(f => ({ ...f, descriptionEn: e.target.value }))} />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Mission type">
                    <select className={inputCls} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                      {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </Field>
                  <Field label="Period">
                    <select className={inputCls} value={form.period} onChange={e => setForm(f => ({ ...f, period: e.target.value }))}>
                      {PERIOD_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Target">
                    <input type="number" className={inputCls} placeholder="10000" value={form.target} onChange={e => setForm(f => ({ ...f, target: Number(e.target.value) }))} />
                  </Field>
                  <Field label="Reward (FCFA)">
                    <input type="number" className={inputCls} placeholder="500" value={form.reward} onChange={e => setForm(f => ({ ...f, reward: Number(e.target.value) }))} />
                  </Field>
                </div>

                <div className="flex items-center justify-between px-4 py-3 bg-white/4 rounded-xl border border-white/8">
                  <div>
                    <p className="text-sm font-medium text-white">Active</p>
                    <p className="text-xs text-white/40">Mission visible to users</p>
                  </div>
                  <button onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                    className={`w-10 h-6 rounded-full transition-colors relative ${form.isActive ? "bg-[#3b6fd4]" : "bg-white/15"}`}>
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${form.isActive ? "translate-x-4" : "translate-x-0.5"}`} />
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 pb-5 flex gap-3">
                <button onClick={closeForm} className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/50 hover:text-white hover:border-white/20 text-sm transition-all">
                  Cancel
                </button>
                <button onClick={save} disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-[#3b6fd4] hover:opacity-90 text-white text-sm font-semibold transition-all disabled:opacity-50">
                  {saving ? "Saving…" : editing ? "Update mission" : "Create mission"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div className="bg-[#0c1428] border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-white/40 text-xs uppercase">
                <th className="px-4 py-3 text-left">Mission</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-right">Target</th>
                <th className="px-4 py-3 text-right">Reward</th>
                <th className="px-4 py-3 text-right">Users</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {missions.map(m => (
                <tr key={m.id} className="hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3 font-medium text-white max-w-[180px] truncate">{m.title}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-[#3b6fd4]/10 text-[#3b6fd4] px-2 py-0.5 rounded-full capitalize">{m.type}</span>
                  </td>
                  <td className="px-4 py-3 text-right text-white/60">{m.target.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-[#f59e0b] font-semibold">{m.reward.toLocaleString()} FCFA</td>
                  <td className="px-4 py-3 text-right text-white/40">{m._count.userMissions}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => toggle(m)}>
                      {m.isActive
                        ? <ToggleRight className="text-[#10b981] mx-auto" size={22} />
                        : <ToggleLeft className="text-white/30 mx-auto" size={22} />}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => openEdit(m)} className="w-7 h-7 flex items-center justify-center rounded-lg text-white/30 hover:text-[#3b6fd4] hover:bg-[#3b6fd4]/10 transition-all">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => del(m.id)} className="w-7 h-7 flex items-center justify-center rounded-lg text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-all">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {missions.length === 0 && (
          <div className="p-12 text-center">
            <Target size={32} className="text-white/15 mx-auto mb-3" />
            <p className="text-white/30 text-sm">No missions yet</p>
            <p className="text-white/20 text-xs mt-1">Click "New mission" to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
