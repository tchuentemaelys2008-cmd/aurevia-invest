"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, ShoppingBag, CheckSquare, Users, Briefcase, Wallet, LogOut, Bell, LayoutDashboard } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const navItems = [
  { href: "/dashboard",      label: "Accueil",    icon: Home },
  { href: "/passes",         label: "Passes",     icon: ShoppingBag },
  { href: "/tasks",          label: "Tâches",     icon: CheckSquare },
  { href: "/affiliate",      label: "Affiliation",icon: Users },
  { href: "/portfolio",      label: "Portfolio",  icon: Briefcase },
  { href: "/wallet",         label: "Wallet",     icon: Wallet },
  { href: "/notifications",  label: "Alertes",    icon: Bell },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [logging, setLogging] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => { if (d.user?.role === "ADMIN") setIsAdmin(true); })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    setLogging(true);
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Déconnecté");
    router.push("/login");
    setLogging(false);
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 flex-col bg-[#070d1a] border-r border-white/5 z-50">
        <div className="p-6 border-b border-white/5">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-[#3b6fd4] to-[#6c4de6] rounded-xl flex items-center justify-center">
              <span className="text-white font-bold font-display text-sm">A</span>
            </div>
            <span className="font-display font-bold text-white text-lg">Aurevia</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link key={href} href={href} className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                active ? "bg-gradient-to-r from-[#3b6fd4]/20 to-[#6c4de6]/10 text-white border border-[#3b6fd4]/20" : "text-white/50 hover:text-white hover:bg-white/5"
              )}>
                <Icon size={18} className={active ? "text-[#3b6fd4]" : ""} />
                {label}
                {active && <div className="ml-auto w-1.5 h-1.5 bg-[#3b6fd4] rounded-full" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-1">
          {isAdmin && (
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-purple-400 bg-purple-400/10 hover:bg-purple-400/15 border border-purple-400/20 transition-all w-full"
            >
              <LayoutDashboard size={18} />
              Panneau Admin
            </Link>
          )}
          <button
            onClick={handleLogout}
            disabled={logging}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-all w-full"
          >
            <LogOut size={18} />
            {logging ? "Déconnexion..." : "Déconnexion"}
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#070d1a]/95 backdrop-blur-xl border-t border-white/5 px-1 pb-safe">
        <div className="flex items-center justify-around py-2">
          {navItems.slice(0, 4).map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link key={href} href={href} className={cn(
                "flex flex-col items-center gap-1 px-2 py-2 rounded-xl transition-all duration-200 min-w-0",
                active ? "text-[#3b6fd4]" : "text-white/40"
              )}>
                <Icon size={20} />
                <span className="text-[10px] font-medium truncate">{label}</span>
              </Link>
            );
          })}

          {isAdmin && (
            <Link href="/admin/dashboard" className="flex flex-col items-center gap-1 px-2 py-2 rounded-xl text-purple-400 min-w-0">
              <LayoutDashboard size={20} />
              <span className="text-[10px] font-medium">Admin</span>
            </Link>
          )}

          <button
            onClick={handleLogout}
            disabled={logging}
            className="flex flex-col items-center gap-1 px-2 py-2 rounded-xl text-white/40 hover:text-red-400 transition-all min-w-0"
          >
            <LogOut size={20} />
            <span className="text-[10px] font-medium">Sortir</span>
          </button>
        </div>
      </nav>
    </>
  );
}
