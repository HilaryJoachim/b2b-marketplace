"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Tag, 
  User, 
  MessageSquare, 
  TrendingUp, 
  Package, 
  Image as ImageIcon, 
  Settings, 
  FileText 
} from 'lucide-react';
import { useSupplierAuth } from '@/context/SupplierAuthContext';

const SIDEBAR_ITEMS = [
  { icon: Home, label: 'Dashboard', href: '/supplier/dashboard' },
  { icon: Tag, label: 'Subscriptions', href: '/supplier/dashboard/subscriptions', badge: 'Offer', badgeColor: 'bg-[#f36a1b]' },
  { icon: User, label: 'Profile', href: '/supplier/dashboard/profile' },
  { icon: MessageSquare, label: 'All Leads', href: '/supplier/dashboard/all-leads' },
  { icon: FileText, label: 'Quotes', href: '/supplier/dashboard/quotes' },
  { icon: Package, label: 'Products', href: '/supplier/dashboard/products' },
  { icon: ImageIcon, label: 'Photos & Docs', href: '/supplier/dashboard/photos' },
];

const SupplierSidebar = () => {
  const pathname = usePathname();
  const { supplierUser } = useSupplierAuth();
  const isDemo = supplierUser?.id === 'sup_demo_001';

  return (
    <aside className="w-64 bg-[#f5f7fa] border-r border-gray-200 min-h-[calc(100vh-60px)] hidden md:flex flex-col py-6 px-4 space-y-3">
      {SIDEBAR_ITEMS.map((item, index) => {
        const isActive = pathname === item.href;
        
        return (
          <Link
            key={index}
            href={item.href}
            className={`
              flex items-center w-full p-3 rounded-lg transition-all shadow-sm cursor-pointer group
              ${isActive 
                ? 'bg-[#f36a1b] text-white' 
                : 'bg-white text-[#002d1b] hover:shadow-md hover:-translate-y-0.5'
              }
            `}
          >
            {/* Icon Circle */}
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center shrink-0 mr-3
              ${isActive ? 'bg-white' : 'bg-gray-50 border border-gray-200'}
            `}>
              <item.icon 
                className={`w-4 h-4 ${isActive ? 'text-[#f36a1b]' : 'text-[#002d1b]'}`} 
                strokeWidth={2} 
              />
            </div>
            
            {/* Label */}
            <span className="text-sm font-semibold flex-1">
              {item.label}
            </span>
            
            {/* Badges */}
            {item.badge && (item.label !== 'All Leads' || isDemo) && (
              <span 
                className={`
                  text-[10px] font-bold px-2 py-0.5 rounded-full ml-2
                  ${isActive ? 'bg-white text-[#f36a1b]' : (item.badgeColor || 'bg-[#002d1b] text-white')}
                `}
              >
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </aside>
  );
};

export default SupplierSidebar;
