"use client";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, UserCheck, UserX, Edit2, X, Check, BadgeCheck, PauseCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import { formatCurrency, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

interface User {
  id: string; name: string; email: string; phone?: string;
  balance: number; totalInvested: number; totalEarnings: number;
  isActive: boolean; isSuspended: boolean; isVerified: boolean; lastActive?: string; createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [toggling, setToggling] = useState<string | null>(null);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [newBalance, setNewBalance] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/users?page=${page}&search=${encodeURIComponent(search)}`);
    const data = await res.json();
    setUsers(data.users || []);
    setTotal(data.total || 0);
    setLoading(false);
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const toggleUser = async (userId: string, isActive: boolean) => {
    setToggling(userId);
    const res = await fetch("/api/admin/users", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, isActive: !isActive }),
    });
    if (res.ok) { setUsers((p) => p.map((u) => u.id === userId ? { ...u, isActive: !isActive } : u)); toast.success(isActive ? "Désactivé" : "Activé"); }
    else toast.error("Erreur");
    setToggling(null);
  };

  const patchUser = async (userId: string, patch: Partial<Pick<User, "isSuspended" | "isVerified">>, label: string) => {
    const res = await fetch("/api/admin/users", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, ...patch }),
    });
    if (res.ok) {
      setUsers((p) => p.map((u) => u.id === userId ? { ...u, ...patch } : u));
      toast.success(label);
    } else toast.error("Erreur");
  };

  const saveBalance = async () => {
    if (!editUser) return;
    const bal = parseFloat(newBalance);
    if (isNaN(bal) || bal < 0) { toast.error("Solde invalide"); return; }
    setSaving(true);
    const res = await fetch("/api/admin/users", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: editUser.id, balance: bal }),
    });
    if (res.ok) { setUsers((p) => p.map((u) => u.id === editUser.id ? { ...u, balance: bal } : u)); toast.success("Solde modifié"); setEditUser(null); }
    else toast.error("Erreur");
    setSaving(false);
  };

  return (
    <div className="p-4 lg:p-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
        <h1 className="text-xl font-display font-bold text-white">Utilisateurs</h1>
        <p className="text-white/40 text-sm">{total} au total</p>
      </motion.div>

      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input placeholder="Rechercher..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-[#5b6ef5]/50" />
      </div>

      {/* Mobile cards */}
      <div className="lg:hidden space-y-3 mb-4">
        {loading ? [...Array(4)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />) :
          users.map((u) => (
            <div key={u.id} className="bg-[#0c1428] rounded-2xl border border-white/8 p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm text-white font-semibold">{u.name}</p>
                  <p className="text-xs text-white/40">{u.email}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${u.isSuspended || !u.isActive ? "text-red-400 bg-red-400/10" : "text-emerald-400 bg-emerald-400/10"}`}>
                  {u.isSuspended ? "Suspendu" : u.isActive ? "Actif" : "Banni"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-400 font-bold text-sm">{formatCurrency(u.balance)}</p>
                  <p className="text-xs text-white/30">investi: {formatCurrency(u.totalInvested)}</p>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => { setEditUser(u); setNewBalance(String(u.balance)); }}
                    className="w-8 h-8 rounded-xl bg-blue-400/10 flex items-center justify-center text-blue-400 hover:bg-blue-400/20"><Edit2 size={13} /></button>
                  <button onClick={() => patchUser(u.id, { isVerified: !u.isVerified }, u.isVerified ? "Badge retire" : "Compte verifie")}
                    className="w-8 h-8 rounded-xl bg-emerald-400/10 flex items-center justify-center text-emerald-400 hover:bg-emerald-400/20"><BadgeCheck size={13} /></button>
                  <button onClick={() => patchUser(u.id, { isSuspended: !u.isSuspended }, u.isSuspended ? "Compte reactive" : "Compte suspendu")}
                    className="w-8 h-8 rounded-xl bg-yellow-400/10 flex items-center justify-center text-yellow-400 hover:bg-yellow-400/20"><PauseCircle size={13} /></button>
                  <button onClick={() => toggleUser(u.id, u.isActive)} disabled={toggling === u.id}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center ${u.isActive ? "bg-red-400/10 text-red-400" : "bg-emerald-400/10 text-emerald-400"}`}>
                    {u.isActive ? <UserX size={13} /> : <UserCheck size={13} />}
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Desktop table */}
      <div className="hidden lg:block bg-[#0c1428] rounded-2xl border border-white/8 overflow-x-auto">
        {loading ? <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-10 rounded-xl" />)}</div> : (
          <table className="w-full">
            <thead><tr className="border-b border-white/5">
              {["Utilisateur","Solde","Investi","Derniere activite","Statut",""].map((h) => (
                <th key={h} className="text-left px-4 py-2.5 text-xs text-white/40 uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-white/5">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-white/2">
                  <td className="px-4 py-2.5"><p className="text-sm text-white font-medium flex items-center gap-1.5">{u.name}{u.isVerified && <BadgeCheck size={13} className="text-emerald-400" />}</p><p className="text-xs text-white/40">{u.email}</p></td>
                  <td className="px-4 py-2.5 text-sm text-emerald-400 font-semibold">{formatCurrency(u.balance)}</td>
                  <td className="px-4 py-2.5 text-sm text-white/60">{formatCurrency(u.totalInvested)}</td>
                  <td className="px-4 py-2.5 text-xs text-white/30">{u.lastActive ? formatDate(u.lastActive) : formatDate(u.createdAt)}</td>
                  <td className="px-4 py-2.5">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${u.isSuspended || !u.isActive ? "text-red-400 bg-red-400/10" : "text-emerald-400 bg-emerald-400/10"}`}>
                      {u.isSuspended ? "Suspendu" : u.isActive ? "Actif" : "Banni"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex gap-1.5">
                      <button onClick={() => { setEditUser(u); setNewBalance(String(u.balance)); }}
                        className="w-7 h-7 rounded-lg bg-blue-400/10 flex items-center justify-center text-blue-400 hover:bg-blue-400/20"><Edit2 size={12} /></button>
                      <button onClick={() => patchUser(u.id, { isVerified: !u.isVerified }, u.isVerified ? "Badge retire" : "Compte verifie")}
                        className="w-7 h-7 rounded-lg bg-emerald-400/10 flex items-center justify-center text-emerald-400 hover:bg-emerald-400/20"><BadgeCheck size={12} /></button>
                      <button onClick={() => patchUser(u.id, { isSuspended: !u.isSuspended }, u.isSuspended ? "Compte reactive" : "Compte suspendu")}
                        className="w-7 h-7 rounded-lg bg-yellow-400/10 flex items-center justify-center text-yellow-400 hover:bg-yellow-400/20"><PauseCircle size={12} /></button>
                      <button onClick={() => toggleUser(u.id, u.isActive)} disabled={toggling === u.id}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center ${u.isActive ? "bg-red-400/10 text-red-400" : "bg-emerald-400/10 text-emerald-400"}`}>
                        {u.isActive ? <UserX size={12} /> : <UserCheck size={12} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex items-center justify-between mt-3">
        <p className="text-xs text-white/40">Page {page} · {users.length} résultats</p>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>←</Button>
          <Button variant="secondary" size="sm" disabled={users.length < 20} onClick={() => setPage((p) => p + 1)}>→</Button>
        </div>
      </div>

      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm bg-[#0c1428] border border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-white text-sm">Modifier le solde</h3>
              <button onClick={() => setEditUser(null)} className="w-7 h-7 rounded-xl bg-white/6 flex items-center justify-center text-white/50"><X size={14} /></button>
            </div>
            <p className="text-sm text-white/70 mb-0.5">{editUser.name}</p>
            <p className="text-xs text-white/30 mb-4">Actuel : <span className="text-emerald-400">{formatCurrency(editUser.balance)}</span></p>
            <label className="text-xs font-medium text-white/60 mb-1.5 block">Nouveau solde (FCFA)</label>
            <input type="number" value={newBalance} onChange={(e) => setNewBalance(e.target.value)} min="0"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#5b6ef5]/50 mb-4" />
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" className="flex-1" onClick={() => setEditUser(null)}>Annuler</Button>
              <Button variant="primary" size="sm" className="flex-1" loading={saving} onClick={saveBalance}><Check size={13} /> Sauvegarder</Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
