"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? "Mode clair / Light mode" : "Mode sombre / Dark mode"}
      aria-label={isDark ? "Activer le mode clair" : "Activer le mode sombre"}
      className="w-8 h-8 rounded-lg bg-white/6 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
    >
      {isDark ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
}
