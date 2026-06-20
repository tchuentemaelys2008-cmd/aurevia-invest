"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home, ShoppingBag, CheckSquare, Target, Trophy, Users, Share2,
  Wallet, Settings, LayoutDashboard, HelpCircle, X, LogOut,
  TrendingUp, Menu, Bell, History, LifeBuoy, Info, BadgeCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import LangToggle from "@/components/ui/LangToggle";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { TKey, useLanguage } from "@/lib/i18n";
import toast from "react-hot-toast";

const NAV_ITEMS = (t: (k: TKey) => string) => [
  { href: "/dashboard",   label: t("nav_home"),        icon: Home },
  { href: "/passes",      label: t("nav_passes"),       icon: ShoppingBag },
  { href: "/tasks",       label: t("nav_tasks"),        icon: CheckSquare },
  { href: "/missions",    label: t("nav_missions"),     icon: Target },
  { href: "/leaderboard", label: t("nav_leaderboard"),  icon: Trophy },
  { href: "/team",        label: t("nav_team"),         icon: Users },
  { href: "/affiliate",   label: t("nav_affiliate"),    icon: Share2 },
  { href: "/wallet",      label: t("nav_wallet"),       icon: Wallet },
  { href: "/simulator",   label: t("nav_simulator"),    icon: TrendingUp },
  { href: "/settings",    label: t("nav_settings"),     icon: Settings },
];

function SidebarContent({ onClose, isAdmin }: { onClose?: () => void; isAdmin: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t, lang } = useLanguage();
  const items = NAV_ITEMS(t);
  const extraItems = [
    { href: "/verification", label: lang === "fr" ? "Vérification" : "Verification", icon: BadgeCheck },
    { href: "/history", label: lang === "fr" ? "Historique" : "History", icon: History },
    { href: "/support", label: lang === "fr" ? "Support" : "Support", icon: LifeBuoy },
    { href: "/about", label: lang === "fr" ? "À propos" : "About", icon: Info },
  ];

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success(t("nav_logout"));
    router.push("/login");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-5 border-b border-white/5 flex items-center justify-between flex-shrink-0">
        <Link href="/dashboard" onClick={onClose} className="flex items-center gap-3">
          <img src="/photo_2026-05-25_14-14-19.jpg" alt="Aurevia" className="w-14 h-14 rounded-xl object-cover border border-white/10" />
          <span className="font-display font-bold text-white text-xl">Aurevia</span>
        </Link>
        <div className="flex items-center gap-2">
          {onClose && (
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-white rounded-lg hover:bg-white/5 transition-all lg:hidden">
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                active
                  ? "bg-gradient-to-r from-[#3b6fd4]/20 to-[#2d5bcc]/10 text-white border border-[#3b6fd4]/20"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon size={17} className={active ? "text-[#3b6fd4]" : ""} />
              <span className="truncate">{label}</span>
              {active && <div className="ml-auto w-1.5 h-1.5 bg-[#3b6fd4] rounded-full flex-shrink-0" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/5 space-y-0.5 flex-shrink-0">
        {extraItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                active ? "bg-gradient-to-r from-[#3b6fd4]/20 to-[#2d5bcc]/10 text-white border border-[#3b6fd4]/20" : "text-white/50 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon size={17} className={active ? "text-[#3b6fd4]" : ""} />
              {label}
            </Link>
          );
        })}
        {isAdmin && (
          <Link
            href="/admin/dashboard"
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-purple-400 bg-purple-400/10 hover:bg-purple-400/15 border border-purple-400/20 transition-all w-full"
          >
            <LayoutDashboard size={17} />
            {t("nav_admin")}
          </Link>
        )}
        <Link href="/help" onClick={onClose} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-white/40 hover:text-white hover:bg-white/5 transition-all">
          <HelpCircle size={17} />
          {t("nav_help")}
        </Link>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400/60 hover:text-red-400 hover:bg-red-400/5 transition-all w-full"
        >
          <LogOut size={17} />
          {t("nav_logout")}
        </button>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const pathname = usePathname();

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => { if (["ADMIN", "SUPER_ADMIN", "MODERATOR"].includes(d.user?.role)) setIsAdmin(true); })
      .catch(() => {});
  }, []);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 flex-col bg-[var(--surface-panel)] border-r border-white/5 z-50">
        <SidebarContent isAdmin={isAdmin} />
      </aside>

      {/* Mobile top bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-[var(--surface-nav)] backdrop-blur-xl border-b border-white/5 flex items-center px-4 gap-2">
        <button
          onClick={() => setOpen(true)}
          className="ui-action-button w-9 h-9 flex items-center justify-center rounded-xl transition-all"
        >
          <Menu size={22} />
        </button>
        <Link href="/dashboard" className="flex items-center gap-2.5 flex-1">
          <img src="/photo_2026-05-25_14-14-19.jpg" alt="Aurevia" className="w-10 h-10 rounded-lg object-cover border border-white/10" />
          <span className="font-display font-bold text-white text-lg">Aurevia</span>
        </Link>
        <Link href="/notifications" className="ui-action-button w-8 h-8 rounded-lg flex items-center justify-center transition-all" aria-label="Notifications">
          <Bell size={15} />
        </Link>
        <ThemeToggle />
        <LangToggle />
      </header>

      {/* Mobile drawer overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-[60] flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="relative w-72 max-w-[85vw] h-full bg-[var(--surface-panel)] border-r border-white/5 flex flex-col overflow-y-auto">
            <SidebarContent onClose={() => setOpen(false)} isAdmin={isAdmin} />
          </aside>
        </div>
      )}
    </>
  );
}
