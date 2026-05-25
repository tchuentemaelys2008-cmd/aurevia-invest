"use client";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, children, disabled, ...props }, ref) => {
    const base = "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed select-none touch-manipulation";
    const variants = {
      primary: "bg-gradient-to-r from-[#3b6fd4] to-[#6c4de6] text-white shadow-[0_4px_20px_rgba(59,111,212,0.35)] hover:shadow-[0_8px_32px_rgba(59,111,212,0.55)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] active:shadow-[0_2px_10px_rgba(59,111,212,0.3)]",
      secondary: "bg-white/6 border border-white/10 text-white hover:bg-white/10 hover:border-white/20 hover:-translate-y-0.5 active:scale-[0.97] active:translate-y-0",
      ghost: "text-white/70 hover:text-white hover:bg-white/6 active:scale-[0.97]",
      danger: "bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 hover:-translate-y-0.5 active:scale-[0.97]",
    };
    const sizes = {
      sm: "text-sm px-4 py-2",
      md: "text-sm px-5 py-2.5",
      lg: "text-base px-6 py-3",
    };

    return (
      <button ref={ref} className={cn(base, variants[variant], sizes[size], className)} disabled={disabled || loading} {...props}>
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
export default Button;
