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
      className="ui-action-button w-8 h-8 rounded-lg flex items-center justify-center transition-all"
    >
      {isDark ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
}
