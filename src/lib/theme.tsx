"use client";

import { createContext, ReactNode, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

const ThemeContext = createContext({
  theme: "light" as Theme,
  setTheme: (_theme: Theme) => {},
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    const saved = localStorage.getItem("aurevia-theme") as Theme | null;
    const next = saved === "light" || saved === "dark" ? saved : "light";
    setThemeState(next);
    document.documentElement.classList.toggle("light", next === "light");
    document.documentElement.classList.toggle("dark", next === "dark");
  }, []);

  const setTheme = (next: Theme) => {
    setThemeState(next);
    localStorage.setItem("aurevia-theme", next);
    document.documentElement.classList.toggle("light", next === "light");
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme: () => setTheme(theme === "dark" ? "light" : "dark") }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
