import { getDefaultSupplier } from "@/lib/data";
import VerifiedBadge from "@/components/supplier/VerifiedBadge";
import SupplierStats from "@/components/supplier/SupplierStats";

interface SupplierTrustCardProps {
  supplierDetails?: {
    name: string;
    location: string;
    logo_url: string | null;
    created_at: string;
  };
}

export default function SupplierTrustCard({ supplierDetails }: SupplierTrustCardProps) {
  const defaultSupplier = getDefaultSupplier();
  
  const supplier = {
    ...defaultSupplier,
    name: supplierDetails?.name || defaultSupplier.name,
    country: supplierDetails?.location || defaultSupplier.country,
    city: supplierDetails?.location ? '' : defaultSupplier.city,
    yearsInBusiness: supplierDetails?.created_at 
      ? Math.max(1, new Date().getFullYear() - new Date(supplierDetails.created_at).getFullYear()) 
      : defaultSupplier.yearsInBusiness,
  };

  return (
    <div className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm">
      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-[#084C41] to-[#0a6b5a] px-5 py-4">
        <div className="flex items-center gap-3.5">
          {/* Avatar */}
          <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-base font-bold text-white border border-white/30 shrink-0 overflow-hidden">
            {supplierDetails?.logo_url ? (
              <img src={supplierDetails.logo_url} alt={supplier.name} className="w-full h-full object-cover" />
            ) : (
              supplier.name.substring(0, 2).toUpperCase()
            )}
          </div>
          {/* Name & Country */}
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-white truncate">
              {supplier.name}
            </h3>
            <p className="text-xs text-white/70 mt-0.5">
              {supplier.countryFlag} {supplier.city ? `${supplier.city}, ` : ''}{supplier.country}
            </p>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="px-5 py-4 space-y-4">
        {/* Badges */}
        <VerifiedBadge
          verified={supplier.verified}
          factoryVerified={supplier.factoryVerified}
          tradeAssurance={supplier.tradeAssurance}
          size="sm"
        />

        {/* Stats */}
        <SupplierStats supplier={supplier} variant="compact" />

        {/* Export Countries */}
        <div className="pt-1">
          <p className="text-[11px] text-gray-400 uppercase tracking-wider font-medium mb-1.5">
            Exports to
          </p>
          <div className="flex flex-wrap gap-1">
            {supplier.exportCountries.slice(0, 4).map((c) => (
              <span
                key={c}
                className="text-[10px] bg-gray-100 text-gray-600 font-medium px-2 py-0.5 rounded-full"
              >
                {c}
              </span>
            ))}
            {supplier.exportCountries.length > 4 && (
              <span className="text-[10px] bg-gray-100 text-gray-500 font-medium px-2 py-0.5 rounded-full">
                +{supplier.exportCountries.length - 4} more
              </span>
            )}
          </div>
        </div>

        {/* Rating Stars */}
        <div className="flex items-center gap-2 pt-1">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                xmlns="http://www.w3.org/2000/svg"
                className={`w-3.5 h-3.5 ${
                  star <= Math.floor(supplier.rating)
                    ? "text-amber-400 fill-amber-400"
                    : star - 0.5 <= supplier.rating
                    ? "text-amber-400 fill-amber-200"
                    : "text-gray-300 fill-gray-200"
                }`}
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                />
              </svg>
            ))}
          </div>
          <span className="text-xs font-bold text-gray-800">{supplier.rating}</span>
          <span className="text-[11px] text-gray-400">({supplier.reviewCount} reviews)</span>
        </div>
      </div>

      {/* ── Footer CTA ── */}
      <div className="px-5 pb-4">
        <a
          href="#supplier-profile"
          className="block w-full text-center text-xs font-semibold text-[#084C41] bg-[#084C41]/8 hover:bg-[#084C41]/15 py-2.5 rounded-lg transition-colors cursor-pointer border border-[#084C41]/15"
        >
          View Full Supplier Profile →
        </a>
      </div>
    </div>
  );
}
