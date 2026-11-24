"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageSquare, FileText, Package, User } from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/supplier/dashboard", icon: Home },
  { label: "All Leads", href: "/supplier/dashboard/all-leads", icon: MessageSquare },
  { label: "Quotes", href: "/supplier/dashboard/quotes", icon: FileText },
  { label: "Products", href: "/supplier/dashboard/products", icon: Package },
  { label: "Profile", href: "/supplier/dashboard/profile", icon: User },
];

export default function SupplierBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#002d1b] text-white border-t border-emerald-950 py-1.5 px-2 flex items-center justify-around shadow-lg">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg text-xs font-medium transition-colors ${
              isActive ? "text-[#f36a1b] font-bold" : "text-gray-300 hover:text-white"
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? "text-[#f36a1b]" : "text-gray-300"}`} />
            <span className="text-[10px]">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
