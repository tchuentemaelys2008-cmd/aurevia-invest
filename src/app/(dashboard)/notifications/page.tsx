"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Bell, CheckCheck, Info, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import Card from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

const typeIcon: Record<string, React.ReactNode> = {
  success: <CheckCircle size={18} className="text-emerald-400" />,
  error: <XCircle size={18} className="text-red-400" />,
  warning: <AlertTriangle size={18} className="text-yellow-400" />,
  info: <Info size={18} className="text-[#5b6ef5]" />,
};

const typeBg: Record<string, string> = {
  success: "bg-emerald-400/10",
  error: "bg-red-400/10",
  warning: "bg-yellow-400/10",
  info: "bg-[#5b6ef5]/10",
};

export default function NotificationsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/notifications");
      if (res.status === 401) { router.push("/login"); return; }
      const data = await res.json();
      setNotifications(data.notifications || []);
      setLoading(false);
    };
    load();
  }, [router]);

  if (loading) return (
    <div className="p-6 space-y-3">
      {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-16 rounded-2xl" />)}
    </div>
  );

  return (
    <div className="max-w-xl mx-auto px-4 pt-8 pb-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <p className="text-white/40 text-sm mb-1">Account</p>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-display font-bold text-white">{t("notif_title")}</h1>
          {notifications.length > 0 && (
            <span className="text-xs text-white/30 flex items-center gap-1">
              <CheckCheck size={13} /> {notifications.length} au total
            </span>
          )}
        </div>
      </motion.div>

      {notifications.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
          <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Bell size={28} className="text-white/20" />
          </div>
          <p className="text-white/40 font-medium">{t("notif_empty")}</p>
          <p className="text-white/20 text-sm mt-1">{t("notif_empty_sub")}</p>
        </motion.div>
      ) : (
        <Card className="divide-y divide-white/5">
          {notifications.map((n, i) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-start gap-3 py-4 first:pt-0 last:pb-0 ${!n.isRead ? "opacity-100" : "opacity-70"}`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${typeBg[n.type] || typeBg.info}`}>
                {typeIcon[n.type] || typeIcon.info}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm text-white font-semibold">{n.title}</p>
                  {!n.isRead && <span className="w-1.5 h-1.5 bg-[#5b6ef5] rounded-full flex-shrink-0" />}
                </div>
                <p className="text-xs text-white/50 mt-0.5">{n.message}</p>
                <p className="text-[10px] text-white/25 mt-1">{formatDate(n.createdAt)}</p>
              </div>
            </motion.div>
          ))}
        </Card>
      )}
    </div>
  );
}
