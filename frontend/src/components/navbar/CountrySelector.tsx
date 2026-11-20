"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useCountry, COUNTRIES } from "@/context/CountryContext";

export default function CountrySelector() {
  const { country: selected, setCountry } = useCountry();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // ── Click-outside ──
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Auto-focus search when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Filter countries by search query
  const filteredCountries = useMemo(() => {
    if (!search.trim()) return COUNTRIES;
    const q = search.toLowerCase();
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.currency.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [search]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (isOpen) setSearch("");
  };

  const handleSelect = (country: typeof COUNTRIES[0]) => {
    setCountry(country);
    setIsOpen(false);
    setSearch("");
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger Button */}
      <button
        onClick={handleToggle}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Select delivery country"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-3.5 h-3.5 text-gray-400 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
        <span className="text-gray-400 hidden sm:inline">Deliver to</span>
        <span className="font-semibold text-gray-800">
          {selected.flag} {selected.name}
        </span>
        <span className="text-[10px] text-gray-400 hidden sm:inline">({selected.currency})</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-[60] animate-[fadeIn_0.12s_ease-out]">
          {/* Search Input */}
          <div className="px-3 pt-3 pb-2">
            <div className="relative">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search country..."
                className="w-full pl-8 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#F36A1B]/40 focus:border-[#F36A1B]/50 transition-all"
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setIsOpen(false);
                    setSearch("");
                  }
                }}
              />
            </div>
          </div>

          {/* Country List */}
          <ul role="listbox" className="max-h-[240px] overflow-y-auto pb-1.5">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((c) => {
                const isSelected = c.code === selected.code;
                return (
                  <li
                    key={c.code}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(c)}
                    className={`flex items-center gap-2.5 px-3 py-2 mx-1.5 rounded-lg cursor-pointer transition-colors text-sm ${
                      isSelected
                        ? "bg-[#F36A1B]/5 text-[#F36A1B] font-semibold"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-base leading-none shrink-0">{c.flag}</span>
                    <span className="flex-1 truncate">{c.name}</span>
                    <span
                      className={`text-[10px] font-mono ${
                        isSelected ? "text-[#F36A1B]/70" : "text-gray-400"
                      }`}
                    >
                      {c.currency}
                    </span>
                    {isSelected && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-3.5 h-3.5 text-[#F36A1B] shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </li>
                );
              })
            ) : (
              <li className="px-3 py-4 text-center text-xs text-gray-400">
                No countries found
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
