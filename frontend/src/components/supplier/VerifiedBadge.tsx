import type { SupplierData } from "@/lib/data";

interface VerifiedBadgeProps {
  verified: boolean;
  factoryVerified?: boolean;
  tradeAssurance?: boolean;
  size?: "sm" | "md";
}

export default function VerifiedBadge({
  verified,
  factoryVerified,
  tradeAssurance,
  size = "md",
}: VerifiedBadgeProps) {
  if (!verified && !factoryVerified && !tradeAssurance) return null;

  const isSmall = size === "sm";

  return (
    <div className={`flex flex-wrap gap-1.5 ${isSmall ? "gap-1" : "gap-1.5"}`}>
      {/* Verified Supplier */}
      {verified && (
        <div className="group relative">
          <span
            className={`inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 font-semibold rounded-full border border-emerald-200 ${
              isSmall ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={isSmall ? "w-3 h-3" : "w-3.5 h-3.5"}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            Verified
          </span>
          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-[11px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
            Business identity & documents verified
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
          </div>
        </div>
      )}

      {/* Factory Verified */}
      {factoryVerified && (
        <span
          className={`inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 font-semibold rounded-full border border-blue-200 ${
            isSmall ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={isSmall ? "w-3 h-3" : "w-3.5 h-3.5"}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z"
            />
          </svg>
          Factory
        </span>
      )}

      {/* Trade Assurance */}
      {tradeAssurance && (
        <span
          className={`inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 font-semibold rounded-full border border-amber-200 ${
            isSmall ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={isSmall ? "w-3 h-3" : "w-3.5 h-3.5"}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
            />
          </svg>
          Trade Assurance
        </span>
      )}
    </div>
  );
}
