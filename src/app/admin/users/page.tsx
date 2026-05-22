"use client";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, UserCheck, UserX } from "lucide-react";
import Button from "@/components/ui/Button";
import { formatCurrency, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

interface User {
  id: string; name: string; email: string; phone?: string;
  balance: number; totalInvested: number; isActive: boolean; createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [toggling, setToggling] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/users?page=${page}&search=${search}`);
    const data = await res.json();
    setUsers(data.users || []);
    setTotal(data.total || 0);
    setLoading(false);
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const toggleUser = async (userId: string, isActive: boolean) => {
    setToggling(userId);
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, isActive: !isActive }),
    });
    if (res.ok) {
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, isActive: !isActive } : u));
      toast.success(isActive ? "Utilisateur désactivé" : "Utilisateur activé");
    } else toast.error("Erreur");
    setToggling(null);
  };

  return (
    <div className="p-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Utilisateurs</h1>
          <p className="text-white/40 text-sm">{total} utilisateurs au total</p>
        </div>
      </motion.div>

      <div className="relative mb-5">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          placeholder="Rechercher par nom ou email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-[#3b6fd4]/50"
        />
      </div>

      <div className="bg-[#0c1428] rounded-2xl border border-white/8 overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-12 rounded-xl" />)}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {["Utilisateur", "Solde", "Investi", "Inscrit", "Statut", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs text-white/40 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-sm text-white font-medium">{u.name}</p>
                    <p className="text-xs text-white/40">{u.email}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-emerald-400 font-semibold">{formatCurrency(u.balance)}</td>
                  <td className="px-4 py-3 text-sm text-white/60">{formatCurrency(u.totalInvested)}</td>
                  <td className="px-4 py-3 text-xs text-white/30">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${u.isActive ? "text-emerald-400 bg-emerald-400/10" : "text-red-400 bg-red-400/10"}`}>
                      {u.isActive ? "Actif" : "Inactif"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      size="sm"
                      variant={u.isActive ? "danger" : "secondary"}
                      loading={toggling === u.id}
                      onClick={() => toggleUser(u.id, u.isActive)}
                      className="!px-3 !py-1.5 !rounded-lg text-xs"
                    >
                      {u.isActive ? <><UserX size={13} /> Désactiver</> : <><UserCheck size={13} /> Activer</>}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <p className="text-sm text-white/40">Page {page} — {users.length} résultats</p>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Précédent</Button>
          <Button variant="secondary" size="sm" disabled={users.length < 20} onClick={() => setPage((p) => p + 1)}>Suivant</Button>
        </div>
      </div>
    </div>
  );
}
