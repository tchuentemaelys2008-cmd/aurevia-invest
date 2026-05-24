"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { BarChart3, Users, ShoppingBag, ArrowDownCircle, LogOut, Home, Settings, Menu, X, CreditCard, Target, Zap, Sparkles, Trophy, Bell, Shield } from "lucide-react";
import toast from "react-hot-toast";
import { useState } from "react";

const adminNav = [
  { href: "/admin/dashboard",            label: "Tableau de bord",  icon: BarChart3 },
  { href: "/admin/users",                label: "Utilisateurs",     icon: Users },
  { href: "/admin/passes",               label: "Passes",           icon: ShoppingBag },
  { href: "/admin/payments",             label: "Paiements",        icon: CreditCard },
  { href: "/admin/withdrawals",          label: "Retraits",         icon: ArrowDownCircle },
  { href: "/admin/missions",             label: "Missions",         icon: Target },
  { href: "/admin/events",               label: "Événements",       icon: Zap },
  { href: "/admin/spin",                 label: "Spin Wheel",       icon: Sparkles },
  { href: "/admin/leaderboard-manage",   label: "Classement",       icon: Trophy },
  { href: "/admin/notifications-send",   label: "Notifications",    icon: Bell },
  { href: "/admin/logs",                 label: "Logs",             icon: Shield },
  { href: "/admin/settings",             label: "Paramètres",       icon: Settings },
];

function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Déconnecté");
    router.push("/login");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img src="/aurevia-logo.jpg" alt="Aurevia" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
          <div>
            <p className="font-display font-bold text-white text-sm">Aurevia Admin</p>
            <p className="text-[10px] text-white/30">Panneau de gestion</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden w-8 h-8 flex items-center justify-center text-white/40 hover:text-white">
            <X size={18} />
          </button>
        )}
      </div>
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {adminNav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link key={href} href={href} onClick={onClose} className={cn(
              "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
              active ? "bg-[#3b6fd4]/15 text-white border border-[#3b6fd4]/20" : "text-white/40 hover:text-white hover:bg-white/5"
            )}>
              <Icon size={16} className={active ? "text-[#3b6fd4]" : ""} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-white/5 space-y-0.5">
        <Link href="/dashboard" onClick={onClose} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-white/40 hover:text-white hover:bg-white/5 transition-all">
          <Home size={16} /> Site utilisateur
        </Link>
        <button onClick={logout} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-all">
          <LogOut size={16} /> Déconnexion
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (pathname === "/admin/login") return <>{children}</>;

  return (
    <div className="min-h-screen flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-56 bg-[#07090f] border-r border-white/5 flex-col fixed h-screen z-40">
        <Sidebar />
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="relative w-64 bg-[#07090f] border-r border-white/5 flex flex-col h-full z-50">
            <Sidebar onClose={() => setOpen(false)} />
          </aside>
        </div>
      )}

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-[#07090f]/95 backdrop-blur border-b border-white/5 px-4 py-3 flex items-center gap-3">
        <button onClick={() => setOpen(true)} className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white">
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2">
          <img src="/aurevia-logo.jpg" alt="Aurevia" className="w-6 h-6 rounded-md object-cover" />
          <span className="font-display font-bold text-white text-sm">Admin</span>
        </div>
      </div>

      <main className="lg:pl-56 flex-1 min-h-screen pt-14 lg:pt-0">{children}</main>
    </div>
  );
}
