"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Plus, LogIn, Crown, TrendingUp } from "lucide-react";
import toast from "react-hot-toast";
import { useLanguage } from "@/lib/i18n";

interface Team { id: string; name: string; leader: { name: string }; _count: { members: number }; totalInvested: number; isActive: boolean; }

export default function TeamPage() {
  const { t } = useLanguage();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const load = () => fetch("/api/teams").then(r => r.json()).then(d => { setTeams(d.teams || []); setLoading(false); });
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    const res = await fetch("/api/teams", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newName }) });
    const data = await res.json();
    if (res.ok) { toast.success(t("team_created")); setNewName(""); setShowCreate(false); load(); }
    else toast.error(data.error);
    setCreating(false);
  };

  const join = async (id: string) => {
    setJoining(id);
    const res = await fetch(`/api/teams/${id}/join`, { method: "POST" });
    const data = await res.json();
    if (res.ok) { toast.success(t("team_joined")); load(); }
    else toast.error(data.error);
    setJoining(null);
  };

  return (
    <div className="p-4 lg:p-8 max-w-2xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-[#3b6fd4] uppercase tracking-widest mb-1">{t("team_kicker")}</p>
          <h1 className="text-2xl font-display font-bold text-white">{t("team_title")}</h1>
          <p className="text-white/40 text-sm mt-1">{t("team_sub")}</p>
        </div>
        <button onClick={() => setShowCreate(v => !v)} className="flex items-center gap-2 bg-gradient-to-r from-[#3b6fd4] to-[#6c4de6] text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:opacity-90 transition-all">
          <Plus size={16} /> {t("team_create_btn")}
        </button>
      </div>

      {showCreate && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-5 mb-6">
          <p className="font-semibold text-white text-sm mb-3">{t("team_create_title")}</p>
          <div className="flex gap-3">
            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder={t("team_name_placeholder")}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#3b6fd4]/50" />
            <button onClick={create} disabled={creating || !newName.trim()} className="bg-[#3b6fd4] text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:opacity-90 disabled:opacity-50 transition-all">
              {creating ? "..." : t("team_confirm")}
            </button>
          </div>
        </motion.div>
      )}

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 glass-card rounded-2xl animate-pulse" />)}</div>
      ) : teams.length === 0 ? (
        <div className="glass-card rounded-2xl p-10 text-center">
          <Users size={36} className="text-white/20 mx-auto mb-3" />
          <p className="text-white/40">{t("team_empty")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {teams.map((team, i) => (
            <motion.div key={team.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="glass-card rounded-2xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#3b6fd4]/20 to-[#6c4de6]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Users size={18} className="text-[#3b6fd4]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="font-semibold text-white text-sm truncate">{team.name}</p>
                </div>
                <div className="flex items-center gap-3 mt-0.5 text-xs text-white/40">
                  <span className="flex items-center gap-1"><Crown size={10} />{team.leader.name.split(" ")[0]}</span>
                  <span className="flex items-center gap-1"><Users size={10} />{team._count.members}</span>
                  <span className="flex items-center gap-1"><TrendingUp size={10} />{team.totalInvested.toLocaleString()} FCFA</span>
                </div>
              </div>
              <button onClick={() => join(team.id)} disabled={joining === team.id}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#3b6fd4] bg-[#3b6fd4]/10 hover:bg-[#3b6fd4]/20 border border-[#3b6fd4]/20 px-3 py-2 rounded-xl transition-all disabled:opacity-50">
                <LogIn size={13} />{joining === team.id ? "..." : t("team_join")}
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
