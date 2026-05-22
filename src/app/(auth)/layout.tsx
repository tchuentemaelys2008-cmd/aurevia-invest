import LangToggle from "@/components/ui/LangToggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="fixed top-4 right-4 z-50">
        <LangToggle />
      </div>
      <div className="w-full max-w-sm">
        {children}
      </div>
    </div>
  );
}
