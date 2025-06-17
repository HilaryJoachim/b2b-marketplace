import React from "react";
import { Search, User, Menu } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="w-full shadow-md bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <img
            src="/logo.png"
            alt="KifaruTrade Logo"
            width= {40}
            height= {40}
            className="w-10 h-10 object-contain"
          />
        </div>

        {/* Category Dropdown */}
        <div className="hidden md:flex items-center space-x-2">
          <button className="bg-[#002d1b] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#014123]">
            Browse Categories
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex flex-1 mx-4">
          <div className="relative w-full max-w-lg">
            <input
              type="text"
              placeholder="Search for products, suppliers..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b76e2b]"
            />
            <Search className="absolute top-2.5 right-3 text-gray-500" size={20} />
          </div>
        </div>

        {/* Login & Sign Up */}
        <div className="hidden md:flex items-center space-x-3">
          <button className="text-sm font-medium text-[#002d1b] hover:underline">
            Login
          </button>
          <button className="bg-gradient-to-r from-[#b76e2b] to-[#d49c58] text-white px-4 py-2 rounded-lg text-sm hover:opacity-90">
            Sign Up
          </button>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Menu size={24} className="text-[#002d1b]" />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
