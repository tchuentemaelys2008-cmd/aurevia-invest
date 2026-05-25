import Sidebar from "@/components/layout/Sidebar";
import EventBanner from "@/components/ui/EventBanner";
import PurchaseTicker from "@/components/ui/PurchaseTicker";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen lg:pl-64">
      <Sidebar />
      <main className="pt-14 lg:pt-0 min-h-screen">
        <EventBanner />
        <PurchaseTicker />
        {children}
      </main>
    </div>
  );
}
