"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import SupplierNavbar from "@/components/supplier/layout/SupplierNavbar";
import SupplierSidebar from "@/components/supplier/layout/SupplierSidebar";
import { useSupplierAuth } from "@/context/SupplierAuthContext";
import { Loader2 } from "lucide-react";

export default function SupplierDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { supplierUser, isSupplierLoading } = useSupplierAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isSupplierLoading && !supplierUser) {
      router.push("/supplier/login");
    }
  }, [supplierUser, isSupplierLoading, router]);

  if (isSupplierLoading || !supplierUser) {
    return (
      <div className="min-h-screen bg-[#f5f7fa] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#f36a1b]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7fa] flex flex-col font-sans">
      <SupplierNavbar />
      <div className="flex flex-1 overflow-hidden">
        <SupplierSidebar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
