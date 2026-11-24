"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileText, MessageSquareText, User } from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/buyer/dashboard", icon: Home },
  { label: "Quotes", href: "/buyer/dashboard/quotes", icon: FileText },
  { label: "Messages", href: "/buyer/dashboard/messages", icon: MessageSquareText },
  { label: "Profile", href: "/buyer/dashboard/profile", icon: User },
];

export default function BuyerBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 py-1.5 px-3 flex items-center justify-around shadow-lg">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg text-xs font-semibold transition-colors ${
              isActive ? "text-[#f36a1b]" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? "text-[#f36a1b]" : "text-gray-500"}`} />
            <span className="text-[10px]">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
