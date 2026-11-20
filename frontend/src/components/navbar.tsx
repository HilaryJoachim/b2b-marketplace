"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import UserDropdown from "@/components/auth/UserDropdown";
import SearchBar from "@/components/search/SearchBar";
import CountrySelector from "@/components/navbar/CountrySelector";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const { user, isLoading, openAuthModal, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  if (pathname?.startsWith("/supplier/dashboard") || pathname?.startsWith("/buyer/dashboard")) {
    return null;
  }

  return (
    <nav className="w-full shadow-md bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
        {/* Logo + Country */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Clickable Logo */}
          <Link href="/" className="flex items-center shrink-0" aria-label="Go to homepage">
            <img
              src="/logo.png"
              alt="KifaruTrade Logo"
              width={40}
              height={40}
              className="w-10 h-10 object-contain"
            />
          </Link>

          {/* Country Selector — desktop only */}
          <div className="hidden md:block">
            <CountrySelector />
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex flex-1 mx-2 md:mx-4 min-w-0">
          <SearchBar />
        </div>

        {/* Desktop Auth Section */}
        <div className="hidden md:flex items-center space-x-3 shrink-0">
          <Link href="/sell-with-us">
            <button className="text-sm font-medium text-[#f36a1b] hover:text-[#d95a12] bg-orange-50 hover:bg-orange-100 px-4 py-2 rounded-lg transition-colors border border-orange-100 cursor-pointer">
              Sell with us
            </button>
          </Link>
          
          {isLoading ? (
            /* Skeleton while hydrating */
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
              <div className="w-16 h-4 rounded bg-gray-200 animate-pulse" />
            </div>
          ) : user ? (
            /* Logged In: Show user dropdown */
            <UserDropdown />
          ) : (
            /* Logged Out: Show Login & Sign Up */
            <>
              <button
                onClick={() => openAuthModal()}
                className="text-sm font-medium text-[#002d1b] hover:underline cursor-pointer"
              >
                Login
              </button>
              <button
                onClick={() => openAuthModal()}
                className="bg-[#f36a1b] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#d95a12] transition-colors cursor-pointer"
              >
                Sign Up
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden shrink-0">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="cursor-pointer p-1"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X size={24} className="text-[#002d1b]" />
            ) : (
              <Menu size={24} className="text-[#002d1b]" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3 animate-[fadeIn_0.15s_ease-out]">
          {/* Country Selector — mobile */}
          <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2.5">
            <CountrySelector />
          </div>

          {!isLoading && !user && (
            <div className="flex flex-col gap-2 pt-2">
              <Link
                href="/sell-with-us"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full bg-orange-50 text-[#f36a1b] border border-orange-100 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-orange-100 transition-colors cursor-pointer text-center block"
              >
                Sell with us
              </Link>
              <button
                onClick={() => {
                  openAuthModal();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full bg-[#002d1b] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#004026] transition-colors cursor-pointer text-center"
              >
                Login / Sign Up
              </button>
            </div>
          )}

          {!isLoading && user && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-3 px-2 py-2">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#084C41] to-[#0a6b5a] text-white text-xs font-bold flex items-center justify-center">
                  {user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
              <button
                onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                className="w-full text-sm font-medium text-red-600 py-2.5 border border-red-200 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
