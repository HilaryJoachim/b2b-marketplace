"use client";

import { useState, useEffect, useCallback } from "react";

const TABS = [
  { id: "attributes", label: "Attributes" },
  { id: "description", label: "Description" },
  { id: "supplier-profile", label: "Supplier Profile" },
] as const;

// Navbar height offset for scroll calculations
const SCROLL_OFFSET = 120;

export default function ProductTabs() {
  const [activeTab, setActiveTab] = useState<string>("attributes");

  const handleTabClick = (sectionId: string) => {
    setActiveTab(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      const top = element.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  // Update active tab based on scroll position
  const handleScroll = useCallback(() => {
    const scrollPosition = window.scrollY + SCROLL_OFFSET + 40;

    for (let i = TABS.length - 1; i >= 0; i--) {
      const section = document.getElementById(TABS[i].id);
      if (section && section.offsetTop <= scrollPosition) {
        setActiveTab(TABS[i].id);
        break;
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <div className="sticky top-[56px] z-40 bg-white border-b border-gray-200 -mx-6 px-6">
      <nav className="flex gap-0" aria-label="Product detail tabs">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`
                relative px-6 py-4 text-sm font-semibold tracking-wide transition-colors duration-200 cursor-pointer
                ${isActive
                  ? "text-[#F36A1B]"
                  : "text-gray-500 hover:text-gray-800"
                }
              `}
              aria-selected={isActive}
              role="tab"
            >
              {tab.label}
              {/* Active indicator bar */}
              <span
                className={`
                  absolute bottom-0 left-0 right-0 h-[3px] rounded-t-full transition-all duration-300
                  ${isActive ? "bg-[#F36A1B] scale-x-100" : "bg-transparent scale-x-0"}
                `}
              />
            </button>
          );
        })}
      </nav>
    </div>
  );
}
