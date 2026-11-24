import React from "react";
import BuyerSidebar from "@/components/buyer/layout/BuyerSidebar";
import BuyerNavbar from "@/components/buyer/layout/BuyerNavbar";
import BuyerBottomNav from "@/components/buyer/layout/BuyerBottomNav";

export default function BuyerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-[#f9fafb]">
      <BuyerNavbar />
      <div className="flex flex-1 relative z-0">
        <BuyerSidebar />
        <main className="flex-1 w-full relative pb-16 md:pb-0">
          {children}
        </main>
      </div>
      <BuyerBottomNav />
    </div>
  );
}
