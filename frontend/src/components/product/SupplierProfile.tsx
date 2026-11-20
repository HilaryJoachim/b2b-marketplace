import { getDefaultSupplier } from "@/lib/data";
import VerifiedBadge from "@/components/supplier/VerifiedBadge";
import SupplierStats from "@/components/supplier/SupplierStats";

interface SupplierProfileProps {
  supplierDetails?: {
    name: string;
    location: string;
    logo_url: string | null;
    created_at: string;
  };
}

export default function SupplierProfile({ supplierDetails }: SupplierProfileProps) {
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
    <section id="supplier-profile" className="scroll-mt-[120px] pt-10 pb-8">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-7 bg-[#F36A1B] rounded-full" />
        <h2 className="text-xl font-bold text-gray-900">
          Supplier Profile
        </h2>
      </div>

      {/* Supplier Card */}
      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
        {/* Card Header with gradient */}
        <div className="bg-gradient-to-r from-[#084C41] to-[#0a6b5a] px-6 py-8 text-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-bold text-white border border-white/30 shrink-0 overflow-hidden">
              {supplierDetails?.logo_url ? (
                <img src={supplierDetails.logo_url} alt={supplier.name} className="w-full h-full object-cover" />
              ) : (
                supplier.name.substring(0, 2).toUpperCase()
              )}
            </div>

            {/* Name & Verification */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <h3 className="text-lg font-bold">{supplier.name}</h3>
                {supplier.verified && (
                  <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full border border-white/30 w-fit">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Verified Supplier
                  </span>
                )}
              </div>
              <p className="text-sm text-white/80 mt-1">
                {supplier.countryFlag} {supplier.city ? `${supplier.city}, ` : ''}{supplier.country} &nbsp;·&nbsp; {supplier.yearsInBusiness} years in business
              </p>
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6 space-y-6">
          {/* Trust Badges */}
          <VerifiedBadge
            verified={supplier.verified}
            factoryVerified={supplier.factoryVerified}
            tradeAssurance={supplier.tradeAssurance}
          />

          {/* Quick Stats - Full Grid */}
          <SupplierStats supplier={supplier} variant="full" />

          {/* Export Countries */}
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-2">Export Markets</p>
            <div className="flex flex-wrap gap-2">
              {supplier.exportCountries.map((country) => (
                <span
                  key={country}
                  className="bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-full"
                >
                  {country}
                </span>
              ))}
            </div>
          </div>

          {/* Main Products */}
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-2">Main Products</p>
            <div className="flex flex-wrap gap-2">
              {supplier.mainProducts.split(", ").map((product) => (
                <span
                  key={product}
                  className="bg-[#F36A1B]/8 text-[#F36A1B] text-xs font-medium px-3 py-1.5 rounded-full border border-[#F36A1B]/15"
                >
                  {product}
                </span>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-2">About the Company</p>
            <p className="text-sm text-gray-600 leading-relaxed">{supplier.description}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button className="flex-1 bg-[#F36A1B] hover:bg-[#d95a12] text-white font-semibold text-sm px-6 py-3 rounded-lg transition-colors duration-200 cursor-pointer flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact Supplier
            </button>
            <button className="flex-1 border-2 border-[#084C41] text-[#084C41] hover:bg-[#084C41] hover:text-white font-semibold text-sm px-6 py-3 rounded-lg transition-colors duration-200 cursor-pointer flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              View Company Page
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

