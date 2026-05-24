"use client";
import { useEffect, useState } from "react";
import { Shield } from "lucide-react";

interface Log { id: string; adminEmail: string; action: string; target: string | null; createdAt: string; details: Record<string,unknown> | null; }

const ACTION_COLORS: Record<string, string> = {
  CREATE_MISSION: "#10b981", UPDATE_MISSION: "#3b6fd4", DELETE_MISSION: "#ef4444",
  CREATE_EVENT: "#6c4de6", RESET_LEADERBOARD: "#f59e0b",
  SEND_NOTIF_GLOBAL: "#3b6fd4", SEND_NOTIF_TARGETED: "#6c4de6",
};

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);

  useEffect(() => { fetch("/api/admin/logs").then(r => r.json()).then(d => setLogs(d.logs || [])); }, []);

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 bg-white/5 rounded-xl flex items-center justify-center"><Shield size={18} className="text-white/60" /></div>
        <div><h1 className="font-display font-bold text-white text-lg">Journal d'activité</h1><p className="text-white/40 text-xs">{logs.length} actions enregistrées</p></div>
      </div>

      <div className="bg-[#0c1428] border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-white/5 text-white/40 text-xs uppercase">
            <th className="px-4 py-3 text-left">Date</th><th className="px-4 py-3 text-left">Admin</th><th className="px-4 py-3 text-left">Action</th><th className="px-4 py-3 text-left">Cible</th>
          </tr></thead>
          <tbody className="divide-y divide-white/5">
            {logs.map(l => (
              <tr key={l.id} className="hover:bg-white/2 transition-colors">
                <td className="px-4 py-3 text-white/30 text-xs whitespace-nowrap">{new Date(l.createdAt).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}</td>
                <td className="px-4 py-3 text-white/60 text-xs">{l.adminEmail}</td>
                <td className="px-4 py-3">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: `${ACTION_COLORS[l.action] || "#fff"}20`, color: ACTION_COLORS[l.action] || "rgba(255,255,255,0.5)" }}>
                    {l.action.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="px-4 py-3 text-white/30 text-xs font-mono">{l.target?.slice(0, 12) || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && <p className="p-8 text-center text-white/30 text-sm">Aucun log</p>}
      </div>
    </div>
  );
}
