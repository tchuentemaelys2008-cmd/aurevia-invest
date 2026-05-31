"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Edit2, Trash2, X, Check, RefreshCw } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";

interface Pass {
  id: string; name: string; price: number; dailyReturn: number;
  duration: number; description: string; color: string; isActive: boolean;
}

const defaultForm = { name: "", price: 0, dailyReturn: 0, duration: 90, description: "", color: "#5b6ef5" };

export default function AdminPassesPage() {
  const [passes, setPasses] = useState<Pass[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editPass, setEditPass] = useState<Pass | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const syncPasses = async () => {
    setSyncing(true);
    const res = await fetch("/api/admin/passes/sync", { method: "POST" });
    const data = await res.json();
    if (res.ok) { toast.success(data.message || "Passes synchronisés"); load(); }
    else toast.error(data.error || "Erreur");
    setSyncing(false);
  };

  const load = async () => {
    const res = await fetch("/api/passes");
    const data = await res.json();
    setPasses(data.passes || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditPass(null); setForm(defaultForm); setShowModal(true); };
  const openEdit = (p: Pass) => {
    setEditPass(p);
    setForm({ name: p.name, price: p.price, dailyReturn: p.dailyReturn, duration: p.duration, description: p.description || "", color: p.color });
    setShowModal(true);
  };

  const save = async () => {
    if (!form.name || !form.price || !form.dailyReturn) { toast.error("Remplissez tous les champs"); return; }
    setSaving(true);
    const method = editPass ? "PATCH" : "POST";
    const body = editPass ? { ...form, id: editPass.id } : form;
    const res = await fetch("/api/admin/passes", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) {
      toast.success(editPass ? "Pass mis à jour" : "Pass créé");
      setShowModal(false);
      load();
    } else {
      const data = await res.json();
      toast.error(data.error || "Erreur");
    }
    setSaving(false);
  };

  const deletePass = async (id: string) => {
    if (!confirm("Supprimer ce pass ?")) return;
    const res = await fetch("/api/admin/passes", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    if (res.ok) { toast.success("Pass supprimé"); load(); }
    else toast.error("Erreur");
  };

  return (
    <div className="p-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Gestion des Passes</h1>
          <p className="text-white/40 text-sm">{passes.length} passes configurés</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={syncPasses} loading={syncing}>
            <RefreshCw size={15} /> Sync 90j
          </Button>
          <Button variant="primary" onClick={openCreate}>
            <Plus size={16} /> Nouveau Pass
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? [...Array(4)].map((_, i) => <div key={i} className="skeleton h-40 rounded-2xl" />) :
          passes.map((p) => (
            <div key={p.id} className="bg-[#0c1428] rounded-2xl border border-white/8 p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                  <h3 className="font-display font-bold text-white">{p.name}</h3>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(p)} className="w-8 h-8 rounded-xl bg-white/6 flex items-center justify-center text-white/50 hover:text-white transition-colors">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => deletePass(p.id)} className="w-8 h-8 rounded-xl bg-red-400/8 flex items-center justify-center text-red-400/50 hover:text-red-400 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <p className="text-white/40 text-xs mb-4">{p.description}</p>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-2 rounded-xl bg-white/4">
                  <p className="text-lg font-bold text-white">{formatCurrency(p.price)}</p>
                  <p className="text-[10px] text-white/30">Prix</p>
                </div>
                <div className="p-2 rounded-xl bg-white/4">
                  <p className="text-lg font-bold text-emerald-400">{p.dailyReturn}%</p>
                  <p className="text-[10px] text-white/30">Revenu</p>
                </div>
                <div className="p-2 rounded-xl bg-white/4">
                  <p className="text-lg font-bold text-white">{p.duration}j</p>
                  <p className="text-[10px] text-white/30">Durée</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${p.isActive ? "text-emerald-400 bg-emerald-400/10" : "text-red-400 bg-red-400/10"}`}>
                  {p.isActive ? "Actif" : "Inactif"}
                </span>
                <span className="text-xs text-white/30">
                  Gain total: {formatCurrency(p.price * p.dailyReturn * p.duration / 100)}
                </span>
              </div>
            </div>
          ))
        }
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md bg-[#0c1428] border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-bold text-white">{editPass ? "Modifier le Pass" : "Nouveau Pass"}</h3>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-xl bg-white/6 flex items-center justify-center text-white/50 hover:text-white">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3">
              <Input label="Nom du pass" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Aurevia Pro" />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Prix (FCFA)" type="number" value={form.price || ""} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) })} />
                <Input label="Revenu (%)" type="number" value={form.dailyReturn || ""} onChange={(e) => setForm({ ...form, dailyReturn: parseFloat(e.target.value) })} />
              </div>
              <Input label="Durée (jours)" type="number" value={form.duration || ""} onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) })} />
              <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description du pass" />
              <div>
                <label className="text-sm font-medium text-white/70 mb-1.5 block">Couleur</label>
                <div className="flex items-center gap-3">
                  {["#5b6ef5", "#6c5ce7", "#e6874d", "#e6d44d", "#4de68a"].map((c) => (
                    <button key={c} onClick={() => setForm({ ...form, color: c })}
                      className={`w-8 h-8 rounded-xl transition-transform ${form.color === c ? "scale-110 ring-2 ring-white/50" : ""}`}
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
            </div>
            <Button variant="primary" size="lg" className="w-full mt-5" loading={saving} onClick={save}>
              <Check size={16} /> {editPass ? "Mettre à jour" : "Créer le Pass"}
            </Button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
