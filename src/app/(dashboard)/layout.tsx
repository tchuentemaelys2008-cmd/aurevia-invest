import BottomNav from "@/components/layout/BottomNav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen lg:pl-64">
      <BottomNav />
      <main className="pb-24 lg:pb-6 min-h-screen">
        {children}
      </main>
    </div>
  );
}
