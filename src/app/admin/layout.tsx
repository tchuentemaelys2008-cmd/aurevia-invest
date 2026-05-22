"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { BarChart3, Users, ShoppingBag, ArrowDownCircle, LogOut, Home } from "lucide-react";
import toast from "react-hot-toast";

const adminNav = [
  { href: "/admin/dashboard", label: "Tableau de bord", icon: BarChart3 },
  { href: "/admin/users", label: "Utilisateurs", icon: Users },
  { href: "/admin/passes", label: "Passes", icon: ShoppingBag },
  { href: "/admin/withdrawals", label: "Retraits", icon: ArrowDownCircle },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Déconnecté");
    router.push("/login");
  };

  if (pathname === "/admin/login") return <>{children}</>;

  return (
    <div className="min-h-screen flex">
      <aside className="w-60 bg-[#07090f] border-r border-white/5 flex flex-col fixed h-screen">
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-[#3b6fd4] to-[#6c4de6] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold font-display text-sm">A</span>
            </div>
            <div>
              <p className="font-display font-bold text-white text-sm">Aurevia Admin</p>
              <p className="text-[10px] text-white/30">Panneau de gestion</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {adminNav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href} className={cn(
                "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                active ? "bg-[#3b6fd4]/15 text-white border border-[#3b6fd4]/20" : "text-white/40 hover:text-white hover:bg-white/5"
              )}>
                <Icon size={16} className={active ? "text-[#3b6fd4]" : ""} />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-white/5 space-y-1">
          <Link href="/dashboard" className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-white/40 hover:text-white hover:bg-white/5 transition-all">
            <Home size={16} /> Site utilisateur
          </Link>
          <button onClick={logout} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-all">
            <LogOut size={16} /> Déconnexion
          </button>
        </div>
      </aside>
      <main className="pl-60 flex-1 min-h-screen">{children}</main>
    </div>
  );
}
