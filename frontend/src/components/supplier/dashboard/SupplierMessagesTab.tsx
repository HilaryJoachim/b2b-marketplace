"use client";

import { MessageSquareText, Search, Reply } from "lucide-react";

export default function SupplierMessagesTab() {
  // Mock Data
  const messages = [
    {
      id: "1",
      buyerName: "Global Construction Ltd",
      productName: "Industrial Grade Excavator X200",
      message: "Hello, we are interested in purchasing 3 units of the X200. Can you confirm if these are currently in stock and what the delivery timeframe would be to Mombasa port?",
      date: "2024-05-12T14:30:00Z",
      status: "New",
    },
    {
      id: "2",
      buyerName: "AgriTech Africa",
      productName: "Heavy Duty Tractor Pro 4x4",
      message: "Can you provide the detailed technical specifications for the engine? Also interested in knowing about spare parts availability.",
      date: "2024-05-10T09:15:00Z",
      status: "Replied",
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Buyer Inquiries</h2>
          <p className="text-sm text-gray-500">Respond to questions from potential buyers.</p>
        </div>
        
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search messages..." 
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-full sm:w-64"
          />
        </div>
      </div>

      {/* Messages List */}
      <div className="grid gap-4">
        {messages.map((msg) => (
          <div key={msg.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
                  {msg.buyerName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">{msg.buyerName}</h4>
                  <p className="text-xs text-gray-500 font-medium">Re: {msg.productName}</p>
                </div>
              </div>
              {msg.status === "New" ? (
                <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">New Message</span>
              ) : (
                <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2.5 py-1 rounded-full">Replied</span>
              )}
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-700 leading-relaxed">"{msg.message}"</p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-400 font-medium">
                {new Date(msg.date).toLocaleDateString()} at {new Date(msg.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </span>
              <button className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
                <Reply className="w-4 h-4" />
                Reply to Buyer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
