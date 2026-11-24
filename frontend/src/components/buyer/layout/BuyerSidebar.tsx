"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  MessageSquareText, 
  FileText, 
  Settings, 
  User 
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/buyer/dashboard", icon: Home },
  { label: "Profile", href: "/buyer/dashboard/profile", icon: User },
  { label: "Messages", href: "/buyer/dashboard/messages", icon: MessageSquareText },
  { label: "Quotes", href: "/buyer/dashboard/quotes", icon: FileText },
];

export default function BuyerSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex-shrink-0 hidden md:flex flex-col sticky top-[73px]" style={{ height: 'calc(100vh - 73px)' }}>

      <div className="p-4 flex-1 overflow-y-auto space-y-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold ${
                isActive 
                  ? "bg-[#f36a1b] text-white shadow-sm shadow-orange-500/20" 
                  : "text-gray-600 hover:bg-orange-50 hover:text-[#f36a1b]"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
      
      {/* Footer Area */}
      <div className="p-4 border-t border-gray-100">
        <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
          <div className="w-10 h-10 bg-[#f36a1b] rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm text-lg font-bold text-white uppercase">
            {user?.name?.substring(0, 2) || "B"}
          </div>
          <p className="text-sm font-bold text-gray-900">{user?.name || "Buyer"}</p>
          <p className="text-xs text-gray-500 truncate" title={user?.email}>{user?.email || ""}</p>
        </div>
      </div>
    </div>
  );
}
