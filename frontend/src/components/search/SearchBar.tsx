"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import {
  getProducts,
  getAllCategoriesSync,
  type Product,
  type Category,
} from "@/lib/data";
import { useCountry } from "@/context/CountryContext";
import { parseUsdPrice } from "@/lib/formatPrice";

// ── Types ──
interface ProductResult {
  type: "product";
  product: Product;
}

interface CategoryResult {
  type: "category";
  category: Category;
}

type SearchResult = ProductResult | CategoryResult;

// ── Constants ──
const MAX_PRODUCT_RESULTS = 5;
const MAX_CATEGORY_RESULTS = 3;
const DEBOUNCE_MS = 150;

export default function SearchBar() {
  const router = useRouter();
  const { formatPrice } = useCountry();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Data sources ──
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const allCategories = useMemo(() => getAllCategoriesSync(), []);

  useEffect(() => {
    // Fetch all products on mount to support instant search
    getProducts().then(setAllProducts);
  }, []);

  // ── Debounce ──
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  // ── Search logic ──
  const results = useMemo<SearchResult[]>(() => {
    const q = debouncedQuery.toLowerCase();
    if (!q || q.length < 1) return [];

    // Match products by title, category, supplier, keywords
    const matchedProducts = allProducts
      .filter((p) => {
        const searchable = [
          p.title,
          p.category,
          p.supplier || "",
          ...(p.keywords || []),
        ]
          .join(" ")
          .toLowerCase();
        return searchable.includes(q);
      })
      .slice(0, MAX_PRODUCT_RESULTS);

    // Match categories by label
    const matchedCategories = allCategories
      .filter((c) => c.label.toLowerCase().includes(q))
      .slice(0, MAX_CATEGORY_RESULTS);

    const combined: SearchResult[] = [
      ...matchedCategories.map((c) => ({ type: "category" as const, category: c })),
      ...matchedProducts.map((p) => ({ type: "product" as const, product: p })),
    ];

    return combined;
  }, [debouncedQuery, allProducts, allCategories]);

  // ── Event handlers ──
  const handleSelect = useCallback(
    (result: SearchResult) => {
      if (result.type === "product") {
        router.push(`/product/${result.product.slug}`);
      } else {
        router.push(`/?category=${encodeURIComponent(result.category.label)}`);
      }
      setQuery("");
      setIsOpen(false);
      setHighlightedIndex(-1);
      inputRef.current?.blur();
    },
    [router]
  );

  const handleClear = useCallback(() => {
    setQuery("");
    setDebouncedQuery("");
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  }, []);

  // ── Keyboard navigation ──
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen || results.length === 0) {
        if (e.key === "Escape") {
          setIsOpen(false);
          inputRef.current?.blur();
        }
        return;
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev < results.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev > 0 ? prev - 1 : results.length - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (highlightedIndex >= 0 && highlightedIndex < results.length) {
            handleSelect(results[highlightedIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          setIsOpen(false);
          setHighlightedIndex(-1);
          inputRef.current?.blur();
          break;
      }
    },
    [isOpen, results, highlightedIndex, handleSelect]
  );

  // ── Click-outside ──
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Open dropdown when query changes ──
  useEffect(() => {
    if (debouncedQuery.trim().length > 0) {
      setIsOpen(true);
      setHighlightedIndex(-1);
    } else {
      setIsOpen(false);
    }
  }, [debouncedQuery]);

  // ── Highlight matching text ──
  const highlightMatch = (text: string, q: string) => {
    if (!q) return text;
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <span className="font-bold text-[#F36A1B]">{text.slice(idx, idx + q.length)}</span>
        {text.slice(idx + q.length)}
      </>
    );
  };

  const showDropdown = isOpen && debouncedQuery.length > 0;

  return (
    <div ref={containerRef} className="relative w-full max-w-lg">
      {/* Input Wrapper */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          size={18}
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (debouncedQuery.trim().length > 0) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search for products, suppliers..."
          className="w-full pl-10 pr-9 py-2.5 border border-gray-300 rounded-xl text-sm bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F36A1B]/40 focus:border-[#F36A1B] transition-all duration-200"
          aria-label="Search products"
          aria-expanded={showDropdown}
          aria-autocomplete="list"
          role="combobox"
        />
        {/* Clear Button */}
        {query.length > 0 && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Clear search"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-[70] animate-[fadeIn_0.12s_ease-out]">
          {results.length > 0 ? (
            <ul role="listbox" className="max-h-[320px] overflow-y-auto py-1.5">
              {results.map((result, idx) => {
                const isHighlighted = idx === highlightedIndex;

                if (result.type === "category") {
                  return (
                    <li
                      key={`cat-${result.category.label}`}
                      role="option"
                      aria-selected={isHighlighted}
                      onClick={() => handleSelect(result)}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                      className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${
                        isHighlighted ? "bg-[#F36A1B]/5" : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="w-7 h-7 rounded-lg bg-[#084C41]/10 flex items-center justify-center shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-[#084C41]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-800 truncate">
                          {highlightMatch(result.category.label, debouncedQuery)}
                        </p>
                        <p className="text-[11px] text-[#084C41] font-medium">Category</p>
                      </div>
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-gray-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </li>
                  );
                }

                return (
                  <li
                    key={`prod-${result.product.slug}`}
                    role="option"
                    aria-selected={isHighlighted}
                    onClick={() => handleSelect(result)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${
                      isHighlighted ? "bg-[#F36A1B]/5" : "hover:bg-gray-50"
                    }`}
                  >
                    {/* Product Thumbnail */}
                    <div className="w-9 h-9 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                      <img
                        src={result.product.image}
                        alt={result.product.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-800 truncate">
                        {highlightMatch(result.product.title, debouncedQuery)}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-400 truncate">{result.product.category}</span>
                        <span className="text-[11px] font-semibold text-[#F36A1B]">{formatPrice(parseUsdPrice(result.product.price))}</span>
                      </div>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-gray-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </li>
                );
              })}
            </ul>
          ) : (
            /* No Results */
            <div className="px-4 py-8 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Search size={20} className="text-gray-300" />
              </div>
              <p className="text-sm font-medium text-gray-500">No products found</p>
              <p className="text-xs text-gray-400 mt-1">
                Try a different keyword like &ldquo;tractor&rdquo; or &ldquo;mining&rdquo;
              </p>
            </div>
          )}

          {/* Footer */}
          {results.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-100 bg-gray-50/50">
              <p className="text-[11px] text-gray-400 text-center">
                <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-[10px] font-mono">↑↓</kbd> navigate · <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-[10px] font-mono">↵</kbd> select · <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-[10px] font-mono">esc</kbd> close
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
