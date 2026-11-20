"use client";

import { useAuth } from "@/context/AuthContext";
import { useInquiries, type Inquiry, type InquiryStatus } from "@/context/InquiryContext";

// ── Status Badge ──
const STATUS_CONFIG: Record<InquiryStatus, { bg: string; text: string; dot: string }> = {
  Sent: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  Viewed: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  Replied: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
};

function StatusBadge({ status }: { status: InquiryStatus }) {
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
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-800 mb-1">No Messages Yet</h3>
      <p className="text-sm text-gray-500 max-w-xs">
        When you contact suppliers about products, your inquiries will appear here.
      </p>
    </div>
  );
}

// ── Inquiry Card ──
function InquiryCard({ inquiry }: { inquiry: Inquiry }) {
  const date = new Date(inquiry.createdAt);
  const formattedDate = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const formattedTime = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow duration-200">
      {/* Header Row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Product Icon */}
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-gray-900 truncate">{inquiry.productName}</h4>
            <p className="text-xs text-gray-500 truncate">To: {inquiry.supplierName}</p>
          </div>
        </div>
        <StatusBadge status={inquiry.status} />
      </div>

      {/* Message Preview */}
      <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 mb-3">
        {inquiry.message}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <span className="text-xs text-gray-400">
          {formattedDate} · {formattedTime}
        </span>
        <button className="text-xs font-medium text-primary hover:underline cursor-pointer">
          View Details
        </button>
      </div>
    </div>
  );
}

// ── Main Component ──
export default function MessagesTab() {
  const { user } = useAuth();
  const { getInquiriesByBuyer } = useInquiries();

  if (!user) return null;

  const messages = getInquiriesByBuyer(user.id);

  if (messages.length === 0) return <EmptyState />;

  return (
    <div className="space-y-4">
      {/* Summary Bar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          <span className="font-semibold text-gray-800">{messages.length}</span>{" "}
          {messages.length === 1 ? "inquiry" : "inquiries"} sent
        </p>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Sent</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Viewed</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Replied</span>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {messages.map((inquiry) => (
          <InquiryCard key={inquiry.id} inquiry={inquiry} />
        ))}
      </div>
    </div>
  );
}
