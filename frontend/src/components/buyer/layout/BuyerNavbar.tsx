"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Search, ChevronDown, ScanLine } from "lucide-react";

export default function BuyerNavbar() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push(`/`);
    }
  };
  return (
    <nav className="w-full h-[73px] bg-[#002d1b] sticky top-0 z-50 flex items-center shadow-md">
      <div className="w-full flex items-center justify-between px-4 sm:px-6">
        
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 bg-white rounded flex items-center justify-center p-1">
            <img
              src="/logo.png"
              alt="KifaruTrade Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <span className="text-white font-bold text-xl hidden sm:block">KifaruTrade</span>
        </Link>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-3xl mx-4 lg:mx-12 hidden md:flex h-11 gap-2">
          
          <form onSubmit={handleSearch} className="flex-1 flex gap-2 h-full w-full">
            {/* Input Field Container */}
            <div className="flex-1 flex items-center bg-[#f8f9fa] border border-gray-200 rounded-lg px-4 gap-3 shadow-inner">
              <Search className="w-5 h-5 text-gray-400 shrink-0" />
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Industrial Mixing Machine..."
                className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 focus:outline-none h-full"
              />
            </div>

            {/* Search Button */}
            <button type="submit" className="bg-[#f36a1b] hover:bg-[#d95a12] text-white px-8 rounded-lg font-bold transition-colors shadow-sm shrink-0 text-sm cursor-pointer">
              Search
            </button>
          </form>

        </div>

        {/* Right: Actions */}
        <div className="shrink-0 flex items-center gap-3">
          <Link href="/">
            <button className="bg-white text-[#002d1b] font-bold px-4 py-2 rounded shadow-sm hover:bg-gray-100 transition-colors cursor-pointer">
              Marketplace
            </button>
          </Link>
        </div>

      </div>
    </nav>
  );
}
