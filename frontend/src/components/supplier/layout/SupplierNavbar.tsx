"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  ScanLine, 
  MessageSquare, 
  Package, 
  ChevronDown,
  LogOut
} from 'lucide-react';
import { useSupplierAuth } from '@/context/SupplierAuthContext';

const SupplierNavbar = () => {
  const router = useRouter();
  const { supplierUser, supplierLogout } = useSupplierAuth();
  const isDemo = supplierUser?.id === 'sup_demo_001';
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push(`/`);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="w-full bg-[#002d1b] text-white h-[60px] flex items-center px-4 sticky top-0 z-50">
      {/* Logo */}
      <div className="flex items-center shrink-0 mr-6">
        <Link href="/supplier/dashboard" className="flex items-center gap-1 cursor-pointer">
          <img
            src="/logo.png"
            alt="KifaruTrade Logo"
            width={40}
            height={40}
            className="w-10 h-10 object-contain bg-white rounded p-1"
          />
          <span className="font-bold text-xl tracking-tight hidden sm:block ml-1">KifaruTrade</span>
        </Link>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex-1 max-w-3xl flex items-center h-10 bg-white rounded overflow-hidden">
        {/* Category Dropdown */}
        <button type="button" className="flex items-center gap-1 px-3 bg-white text-gray-700 text-sm font-medium border-r border-gray-200 h-full hover:bg-gray-50 cursor-pointer">
          Buy Leads <ChevronDown className="w-4 h-4 text-gray-500" />
        </button>
        
        {/* Input */}
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter product / service to search" 
          className="flex-1 h-full px-3 text-sm text-gray-900 outline-none"
        />
        
        {/* Camera Icon */}
        <button type="button" className="px-3 text-emerald-500 hover:bg-gray-50 h-full flex items-center cursor-pointer">
          <ScanLine className="w-5 h-5" />
        </button>

        {/* Search Button */}
        <button type="submit" className="px-6 bg-[#f36a1b] hover:bg-[#d95a12] text-white text-sm font-medium h-full flex items-center gap-1 cursor-pointer transition-colors">
          <Search className="w-4 h-4" /> Search
        </button>
      </form>

      {/* Buy With Button */}
      <div className="ml-4 shrink-0 hidden md:block">
        <Link href="/">
          <button className="bg-white text-[#002d1b] px-4 py-1.5 rounded text-sm font-bold hover:bg-gray-100 cursor-pointer transition-colors">
            Marketplace
          </button>
        </Link>
      </div>

      {/* Right Icons */}
      <div className="flex items-center gap-5 ml-auto pl-4">
        <Link href="/supplier/dashboard/all-leads" className="flex flex-col items-center gap-0.5 cursor-pointer hover:text-gray-200 relative">
          <MessageSquare className="w-5 h-5" />
          <span className="text-[10px]">All Leads</span>
          {isDemo && <span className="absolute -top-1.5 right-2 bg-[#f36a1b] text-white text-[9px] font-bold px-1 rounded-full">2</span>}
        </Link>
        
        <Link href="/supplier/dashboard/products" className="flex flex-col items-center gap-0.5 cursor-pointer hover:text-gray-200">
          <Package className="w-5 h-5" />
          <span className="text-[10px]">Products</span>
        </Link>

        {/* User Dropdown */}
        <div className="relative ml-2" ref={dropdownRef}>
          <div
            className="flex flex-col items-center gap-0.5 cursor-pointer hover:text-gray-200"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div className="w-5 h-5 rounded-full border border-white flex items-center justify-center overflow-hidden bg-white text-[#002d1b] font-bold text-[8px]">
              {supplierUser?.name?.slice(0, 2).toUpperCase() ?? "SP"}
            </div>
            <span className="text-[10px] flex items-center gap-0.5 max-w-[80px] truncate">
              Hi {supplierUser?.name?.split(" ")[0] ?? "Supplier"} <ChevronDown className="w-3 h-3 shrink-0" />
            </span>
          </div>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-3 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 text-gray-800 z-[60]">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-bold text-gray-900 truncate">{supplierUser?.companyName ?? supplierUser?.name}</p>
                <p className="text-xs text-gray-400 truncate mt-0.5">{supplierUser?.email}</p>
              </div>
              <div className="py-1">
                <Link 
                  href="/supplier/dashboard/profile"
                  onClick={() => setIsDropdownOpen(false)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                  My Profile
                </Link>
                <button 
                  onClick={() => {
                    setIsDropdownOpen(false);
                    supplierLogout();
                    window.location.href = "/";
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium text-left cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default SupplierNavbar;
