"use client";
import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";

    return (
      <div className="flex flex-col gap-1.5">
        {label && <label className="text-sm font-medium text-white/70">{label}</label>}
        <div className="relative">
          {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">{icon}</div>}
          <input
            ref={ref}
            type={isPassword ? (showPassword ? "text" : "password") : type}
            className={cn(
              "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 text-sm",
              "focus:outline-none focus:border-[#3b6fd4]/60 focus:bg-white/8 transition-all duration-200",
              "hover:border-white/15",
              icon && "pl-10",
              isPassword && "pr-10",
              error && "border-red-500/50 focus:border-red-500/70",
              className
            )}
            {...props}
          />
          {isPassword && (
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
export default Input;
