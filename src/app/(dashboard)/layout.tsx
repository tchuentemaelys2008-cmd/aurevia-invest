import Sidebar from "@/components/layout/Sidebar";
import EventBanner from "@/components/ui/EventBanner";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen lg:pl-64">
      <Sidebar />
      <main className="pt-14 lg:pt-0 min-h-screen">
        <EventBanner />
        {children}
      </main>
    </div>
  );
}
