"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Plus, Crown, TrendingUp, MessageSquare, Phone, X, Check, Bot, Flame, Trash2, ShoppingBag, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useLanguage } from "@/lib/i18n";

interface Team { id: string; name: string; leader: { name: string; id?: string }; _count: { members: number }; totalInvested: number; isActive: boolean; }
interface JoinRequest { id: string; message: string; phone: string; status: string; user: { id: string; name: string; email: string }; }

export default function TeamPage() {
  const { t, lang } = useLanguage();
  const [teams, setTeams] = useState<Team[]>([]);
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [myMemberTeamId, setMyMemberTeamId] = useState<string | null>(null);
  const [hasActivePass, setHasActivePass] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [requestTeam, setRequestTeam] = useState<Team | null>(null);
  const [reqMessage, setReqMessage] = useState("");
  const [reqPhone, setReqPhone] = useState("");
  const [sendingReq, setSendingReq] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<JoinRequest[]>([]);
  const [ledTeamId, setLedTeamId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    const [teamsRes, meRes, passRes] = await Promise.all([
      fetch("/api/teams").then(r => r.json()),
      fetch("/api/auth/me").then(r => r.json()).catch(() => ({})),
      fetch("/api/passes").then(r => r.json()).catch(() => ({})),
    ]);
    const teams = teamsRes.teams || [];
    setTeams(teams);
    const userId = meRes.user?.id || null;
    setMyUserId(userId);
    setMyMemberTeamId(teamsRes.myMemberTeamId || null);

    const passes: Array<{ status: string }> = passRes.userPasses || [];
    setHasActivePass(passes.some(p => p.status === "ACTIVE"));

    setLoading(false);

    if (userId) {
      const myLedTeam = teams.find((t: Team) => t.leader.id === userId);
      if (myLedTeam) {
        setLedTeamId(myLedTeam.id);
        const reqRes = await fetch(`/api/teams/${myLedTeam.id}/requests`).then(r => r.json()).catch(() => ({}));
        setPendingRequests(reqRes.requests || []);
      }
    }
  };

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

  const deleteTeam = async () => {
    if (!ledTeamId) return;
    setDeleting(true);
    const res = await fetch(`/api/teams/${ledTeamId}`, { method: "DELETE" });
    if (res.ok) {
      toast.success(lang === "fr" ? "Équipe supprimée" : "Team deleted");
      setConfirmDelete(false);
      setLedTeamId(null);
      load();
    } else {
      const d = await res.json();
      toast.error(d.error);
    }
    setDeleting(false);
  };

  const sendRequest = async () => {
    if (!requestTeam || !reqMessage.trim() || !reqPhone.trim()) return;
    setSendingReq(true);
    const res = await fetch(`/api/teams/${requestTeam.id}/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: reqMessage, phone: reqPhone }),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success(t("team_request_sent"));
      setRequestTeam(null); setReqMessage(""); setReqPhone("");
    } else {
      toast.error(data.error);
    }
    setSendingReq(false);
  };

  const respondToRequest = async (requestId: string, action: "approve" | "reject") => {
    if (!ledTeamId) return;
    const res = await fetch(`/api/teams/${ledTeamId}/requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId, action }),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success(action === "approve" ? t("team_approved") : t("team_rejected"));
      load();
    } else {
      toast.error(data.error);
    }
  };

  const levelBadge = (level: number) => {
    if (level >= 5) return { label: "IA Advisor", icon: <Bot size={11} />, color: "text-[#6c4de6] bg-[#6c4de6]/10 border-[#6c4de6]/20" };
    if (level >= 3) return { label: "Auto Money", icon: <Flame size={11} />, color: "text-orange-400 bg-orange-400/10 border-orange-400/20" };
    return null;
  };

  return (
    <div className="p-4 lg:p-8 max-w-2xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-[#3b6fd4] uppercase tracking-widest mb-1">{t("team_kicker")}</p>
          <h1 className="text-2xl font-display font-bold" style={{ color: "var(--control-text)" }}>{t("team_title")}</h1>
          <p className="text-sm mt-1" style={{ color: "var(--control-text)", opacity: 0.45 }}>{t("team_sub")}</p>
        </div>
        {!myMemberTeamId && !ledTeamId && (
          <button type="button" onClick={() => setShowCreate(v => !v)}
            className="flex items-center gap-2 bg-gradient-to-r from-[#3b6fd4] to-[#6c4de6] text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:opacity-90 transition-all touch-manipulation">
            <Plus size={16} /> {t("team_create_btn")}
          </button>
        )}
        {ledTeamId && (
          <button type="button" onClick={() => setConfirmDelete(true)}
            className="flex items-center gap-2 text-red-400 bg-red-400/10 hover:bg-red-400/20 border border-red-400/20 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all touch-manipulation">
            <Trash2 size={15} /> {lang === "fr" ? "Supprimer" : "Delete team"}
          </button>
        )}
      </div>

      {/* No active pass warning */}
      {!hasActivePass && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="mb-5 flex items-start gap-3 px-4 py-3 rounded-2xl border border-yellow-400/25 bg-yellow-400/8">
          <AlertCircle size={16} className="text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-yellow-400">
              {lang === "fr" ? "Pass requis pour rejoindre une équipe" : "Active pass required to join a team"}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--control-text)", opacity: 0.5 }}>
              {lang === "fr" ? "Achetez un pass actif avant d'envoyer une demande." : "Buy an active pass before sending a join request."}
            </p>
          </div>
          <a href="/passes" className="ml-auto flex-shrink-0 flex items-center gap-1 text-xs font-semibold text-[#3b6fd4] bg-[#3b6fd4]/10 px-3 py-1.5 rounded-xl">
            <ShoppingBag size={12} />{lang === "fr" ? "Passes" : "Passes"}
          </a>
        </motion.div>
      )}

      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="glass-card rounded-2xl p-5 mb-6">
            <p className="font-semibold text-sm mb-3" style={{ color: "var(--control-text)" }}>{t("team_create_title")}</p>
            <div className="flex gap-3">
              <input value={newName} onChange={e => setNewName(e.target.value)} placeholder={t("team_name_placeholder")}
                className="flex-1 bg-white/5 border border-[var(--control-border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#3b6fd4]/50"
                style={{ color: "var(--control-text)" }} />
              <button type="button" onClick={create} disabled={creating || !newName.trim()}
                className="bg-[#3b6fd4] text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:opacity-90 disabled:opacity-50 transition-all touch-manipulation">
                {creating ? "..." : t("team_confirm")}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pending requests for leader */}
      {pendingRequests.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-semibold text-[#3b6fd4] uppercase tracking-widest mb-3">{t("team_requests_title")} ({pendingRequests.length})</p>
          <div className="space-y-2">
            {pendingRequests.map((req) => (
              <motion.div key={req.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="glass-card rounded-2xl p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="font-semibold text-sm" style={{ color: "var(--control-text)" }}>{req.user.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--control-text)", opacity: 0.5 }}><Phone size={10} className="inline mr-1" />{req.phone}</p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => respondToRequest(req.id, "approve")}
                      className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-400/10 hover:bg-emerald-400/20 border border-emerald-400/20 px-3 py-1.5 rounded-xl transition-all touch-manipulation">
                      <Check size={12} />{t("team_approve")}
                    </button>
                    <button type="button" onClick={() => respondToRequest(req.id, "reject")}
                      className="flex items-center gap-1 text-xs font-semibold text-red-400 bg-red-400/10 hover:bg-red-400/20 border border-red-400/20 px-3 py-1.5 rounded-xl transition-all touch-manipulation">
                      <X size={12} />{t("team_reject")}
                    </button>
                  </div>
                </div>
                <p className="text-xs p-2 rounded-lg bg-white/4" style={{ color: "var(--control-text)", opacity: 0.6 }}>
                  <MessageSquare size={10} className="inline mr-1" />{req.message}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-20 glass-card rounded-2xl animate-pulse" />)}</div>
      ) : teams.length === 0 ? (
        <div className="glass-card rounded-2xl p-10 text-center">
          <Users size={36} className="mx-auto mb-3" style={{ color: "var(--control-text)", opacity: 0.2 }} />
          <p style={{ color: "var(--control-text)", opacity: 0.4 }}>{t("team_empty")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {teams.map((team, i) => {
            const isMyLedTeam = team.leader.id === myUserId;
            const isMyMemberTeam = myMemberTeamId === team.id;
            const badge = levelBadge(team._count.members);
            const alreadyInATeam = !!myMemberTeamId;
            const canRequest = !alreadyInATeam && !isMyLedTeam && hasActivePass;

            return (
              <motion.div key={team.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className={`glass-card rounded-2xl p-5 flex items-center gap-4 ${isMyMemberTeam ? "ring-1 ring-[#3b6fd4]/30" : ""}`}>
                <div className="w-10 h-10 bg-gradient-to-br from-[#3b6fd4]/20 to-[#6c4de6]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Users size={18} className="text-[#3b6fd4]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm truncate" style={{ color: "var(--control-text)" }}>{team.name}</p>
                    {isMyLedTeam && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#3b6fd4]/15 text-[#3b6fd4] border border-[#3b6fd4]/20 flex items-center gap-0.5">
                        <Crown size={8} />{lang === "fr" ? "Votre équipe" : "Your team"}
                      </span>
                    )}
                    {isMyMemberTeam && !isMyLedTeam && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 flex items-center gap-0.5">
                        <Check size={8} />{lang === "fr" ? "Mon équipe" : "My team"}
                      </span>
                    )}
                    {badge && (
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border flex items-center gap-0.5 ${badge.color}`}>
                        {badge.icon}{badge.label}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs" style={{ color: "var(--control-text)", opacity: 0.4 }}>
                    <span className="flex items-center gap-1"><Crown size={10} />{team.leader.name.split(" ")[0]}</span>
                    <span className="flex items-center gap-1"><Users size={10} />{team._count.members}</span>
                    <span className="flex items-center gap-1"><TrendingUp size={10} />{team.totalInvested.toLocaleString()} FCFA</span>
                  </div>
                </div>
                {canRequest && (
                  <button type="button" onClick={() => setRequestTeam(team)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#3b6fd4] bg-[#3b6fd4]/10 hover:bg-[#3b6fd4]/20 border border-[#3b6fd4]/20 px-3 py-2 rounded-xl transition-all touch-manipulation">
                    <MessageSquare size={13} />{t("team_request_btn")}
                  </button>
                )}
                {alreadyInATeam && !isMyLedTeam && !isMyMemberTeam && (
                  <span className="text-xs text-white/20 italic">{lang === "fr" ? "Déjà membre" : "Already in team"}</span>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Join request modal */}
      <AnimatePresence>
        {requestTeam && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
              className="w-full max-w-sm rounded-2xl p-6 border border-[var(--control-border)]"
              style={{ background: "var(--surface-card)" }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold" style={{ color: "var(--control-text)" }}>{t("team_request_title")}</h3>
                <button type="button" onClick={() => setRequestTeam(null)} className="w-8 h-8 rounded-xl bg-white/6 flex items-center justify-center touch-manipulation" style={{ color: "var(--control-text)", opacity: 0.5 }}>
                  <X size={16} />
                </button>
              </div>
              <p className="text-sm mb-4 font-semibold" style={{ color: "var(--control-text)" }}>{requestTeam.name}</p>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--control-text)", opacity: 0.6 }}>{t("team_request_message")}</label>
                  <textarea value={reqMessage} onChange={e => setReqMessage(e.target.value)} rows={3}
                    placeholder={lang === "fr" ? "Bonjour, je souhaite rejoindre..." : "Hello, I'd like to join..."}
                    className="w-full rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#3b6fd4]/50 resize-none"
                    style={{ background: "var(--control-bg)", border: "1px solid var(--control-border)", color: "var(--control-text)" }} />
                </div>
                <div>
                  <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--control-text)", opacity: 0.6 }}>{t("team_request_phone")}</label>
                  <div className="flex items-center gap-2 rounded-xl px-4 py-2.5" style={{ background: "var(--control-bg)", border: "1px solid var(--control-border)" }}>
                    <Phone size={14} style={{ color: "var(--control-text)", opacity: 0.4 }} />
                    <input value={reqPhone} onChange={e => setReqPhone(e.target.value)} type="tel" placeholder="+237 6XX XXX XXX"
                      className="flex-1 bg-transparent outline-none text-sm" style={{ color: "var(--control-text)" }} />
                  </div>
                </div>
                <button type="button" onClick={sendRequest} disabled={sendingReq || !reqMessage.trim() || !reqPhone.trim()}
                  className="w-full bg-gradient-to-r from-[#3b6fd4] to-[#6c4de6] text-white text-sm font-semibold py-3 rounded-xl hover:opacity-90 disabled:opacity-50 transition-all touch-manipulation">
                  {sendingReq ? "..." : t("team_request_submit")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {confirmDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-2xl p-6 border border-red-400/20"
              style={{ background: "var(--surface-card)" }}>
              <div className="w-12 h-12 rounded-2xl bg-red-400/10 flex items-center justify-center mx-auto mb-4">
                <Trash2 size={22} className="text-red-400" />
              </div>
              <h3 className="text-center font-display font-bold mb-2" style={{ color: "var(--control-text)" }}>
                {lang === "fr" ? "Supprimer l'équipe ?" : "Delete this team?"}
              </h3>
              <p className="text-center text-sm mb-6" style={{ color: "var(--control-text)", opacity: 0.5 }}>
                {lang === "fr" ? "Cette action est irréversible. Tous les membres seront exclus." : "This action is irreversible. All members will be removed."}
              </p>
              <div className="flex gap-3">
                <button type="button" onClick={() => setConfirmDelete(false)}
                  className="flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-all"
                  style={{ borderColor: "var(--control-border)", color: "var(--control-text)", opacity: 0.6 }}>
                  {lang === "fr" ? "Annuler" : "Cancel"}
                </button>
                <button type="button" onClick={deleteTeam} disabled={deleting}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-all disabled:opacity-50">
                  {deleting ? "..." : lang === "fr" ? "Supprimer" : "Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
