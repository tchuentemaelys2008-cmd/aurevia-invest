import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  onClick?: () => void;
}

export default function Card({ children, className, glow, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "glass-card rounded-2xl p-5 relative overflow-hidden transition-all duration-200",
        glow && "glow-blue",
        onClick && "cursor-pointer card-lift select-none touch-manipulation",
        className
      )}
    >
      {children}
    </div>
  );
}

export function StatCard({ title, value, sub, icon, trend }: { title: string; value: string; sub?: string; icon?: React.ReactNode; trend?: number }) {
  return (
    <Card>
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs text-white/40 uppercase tracking-wider font-medium">{title}</span>
        {icon && <div className="w-9 h-9 rounded-xl bg-white/6 flex items-center justify-center text-blue-400">{icon}</div>}
      </div>
      <div className="text-2xl font-bold font-display text-white mb-1">{value}</div>
      <div className="flex items-center gap-2">
        {trend !== undefined && (
          <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", trend >= 0 ? "text-emerald-400 bg-emerald-400/10" : "text-red-400 bg-red-400/10")}>
            {trend >= 0 ? "+" : ""}{trend}%
          </span>
        )}
        {sub && <span className="text-xs text-white/40">{sub}</span>}
      </div>
    </Card>
  );
}
