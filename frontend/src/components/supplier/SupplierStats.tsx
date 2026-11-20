import type { SupplierData } from "@/lib/data";

interface SupplierStatsProps {
  supplier: SupplierData;
  variant?: "compact" | "full";
}

export default function SupplierStats({ supplier, variant = "compact" }: SupplierStatsProps) {
  const stats = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
      ),
      label: "In Business",
      value: `${supplier.yearsInBusiness} Years`,
      sublabel: `Est. ${supplier.establishedYear}`,
      color: "text-gray-700",
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      label: "Response Time",
      value: supplier.responseTime,
      sublabel: `${supplier.responseRate} rate`,
      color: "text-[#F36A1B]",
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
        </svg>
      ),
      label: "Inquiries",
      value: supplier.inquiryCount.toLocaleString(),
      sublabel: `${supplier.successfulQuotations} quoted`,
      color: "text-gray-700",
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
        </svg>
      ),
      label: "Rating",
      value: `${supplier.rating}/5`,
      sublabel: `${supplier.reviewCount} reviews`,
      color: "text-amber-600",
    },
  ];

  if (variant === "compact") {
    return (
      <div className="space-y-2.5">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 shrink-0">
              {stat.icon}
            </div>
            <div className="flex items-center justify-between flex-1 min-w-0">
              <span className="text-xs text-gray-500">{stat.label}</span>
              <span className={`text-xs font-bold ${stat.color}`}>{stat.value}</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Full variant - used in the supplier profile tab
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-gray-50 rounded-xl p-4 text-center hover:shadow-sm transition-shadow">
          <div className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-400 mx-auto mb-2.5 shadow-sm">
            {stat.icon}
          </div>
          <p className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">{stat.label}</p>
          <p className={`text-sm font-bold mt-0.5 ${stat.color}`}>{stat.value}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">{stat.sublabel}</p>
        </div>
      ))}
    </div>
  );
}
