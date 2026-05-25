import Sidebar from "@/components/layout/Sidebar";
import EventBanner from "@/components/ui/EventBanner";
import PurchaseTicker from "@/components/ui/PurchaseTicker";
import GiftButton from "@/components/ui/GiftButton";
import WelcomePopup from "@/components/ui/WelcomePopup";
import Footer from "@/components/ui/Footer";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen lg:pl-64 flex flex-col">
      <Sidebar />
      <main className="pt-14 lg:pt-0 flex-1">
        <EventBanner />
        <PurchaseTicker />
        {children}
      </main>
      <Footer />
      <GiftButton />
      <WelcomePopup />
    </div>
  );
}
