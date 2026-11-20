"use client";

import { useAuth } from "@/context/AuthContext";
import { useInquiries, type RFQ, type RFQStatus } from "@/context/InquiryContext";

// ── Status Badge ──
const STATUS_CONFIG: Record<RFQStatus, { bg: string; text: string; dot: string }> = {
  Pending: { bg: "bg-gray-100", text: "text-gray-700", dot: "bg-gray-400" },
  Viewed: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  "Quotation Sent": { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  Replied: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
};

function StatusBadge({ status }: { status: RFQStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {status}
    </span>
  );
}

// ── Empty State ──
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-5">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-9 h-9 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-800 mb-1">No RFQs Yet</h3>
      <p className="text-sm text-gray-500 max-w-xs">
        When you request quotations from suppliers, your RFQs will appear here.
      </p>
    </div>
  );
}

// ── RFQ Row ──
function RFQRow({ rfq }: { rfq: RFQ }) {
  const date = new Date(rfq.createdAt);
  const formattedDate = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow duration-200">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        {/* Left: Product & Supplier Info */}
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-gray-900 truncate">{rfq.productName}</h4>
            <p className="text-xs text-gray-500 truncate">To: {rfq.supplierName}</p>
          </div>
        </div>
        <StatusBadge status={rfq.status} />
      </div>

      {/* Detail Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-gray-100">
        <div>
          <p className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">Quantity</p>
          <p className="text-sm font-semibold text-gray-800 mt-0.5">{rfq.quantity} Units</p>
        </div>
        <div>
          <p className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">Country</p>
          <p className="text-sm font-semibold text-gray-800 mt-0.5">{rfq.country}</p>
        </div>
        <div>
          <p className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">Required By</p>
          <p className="text-sm font-semibold text-gray-800 mt-0.5">
            {rfq.requiredDate
              ? new Date(rfq.requiredDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
              : "—"}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">Submitted</p>
          <p className="text-sm font-semibold text-gray-800 mt-0.5">{formattedDate}</p>
        </div>
      </div>

      {/* Message preview if available */}
      {rfq.message && (
        <p className="text-xs text-gray-500 mt-3 line-clamp-1 italic">
          &ldquo;{rfq.message}&rdquo;
        </p>
      )}
    </div>
  );
}

// ── Main Component ──
export default function RFQTab() {
  const { user } = useAuth();
  const { getRFQsByBuyer } = useInquiries();

  if (!user) return null;

  const rfqs = getRFQsByBuyer(user.id);

  if (rfqs.length === 0) return <EmptyState />;

  return (
    <div className="space-y-4">
      {/* Summary Bar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          <span className="font-semibold text-gray-800">{rfqs.length}</span>{" "}
          {rfqs.length === 1 ? "quotation request" : "quotation requests"}
        </p>
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-gray-400" /> Pending</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Viewed</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Quoted</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Replied</span>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {rfqs.map((rfq) => (
          <RFQRow key={rfq.id} rfq={rfq} />
        ))}
      </div>
    </div>
  );
}
