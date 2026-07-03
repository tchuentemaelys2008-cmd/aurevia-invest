import LangToggle from "@/components/ui/LangToggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-glow relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      <div className="fixed top-4 right-4 z-50">
        <LangToggle />
      </div>
      <div className="relative z-10 w-full max-w-sm">
        {children}
      </div>
    </div>
  );
}
