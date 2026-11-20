"use client";

import { FileText, Search, Check, X, FileEdit } from "lucide-react";

export default function SupplierRFQTab() {
  // Mock Data
  const rfqs = [
    {
      id: "RFQ-2024-089",
      buyerName: "BuildRight Contractors",
      productName: "Industrial Grade Excavator X200",
      quantity: 5,
      targetPrice: 22000,
      details: "Looking to purchase 5 units for an upcoming major infrastructure project. Requesting a bulk discount.",
      date: "2024-05-11T10:00:00Z",
      status: "Pending",
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Requests for Quotation (RFQs)</h2>
          <p className="text-sm text-gray-500">Review and respond to bulk quote requests.</p>
        </div>
        
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search RFQs..." 
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-full sm:w-64"
          />
        </div>
      </div>

      {/* RFQ List */}
      <div className="grid gap-4">
        {rfqs.map((rfq) => (
          <div key={rfq.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4 text-secondary" />
                  <span className="text-xs font-bold text-secondary uppercase tracking-wider">{rfq.id}</span>
                </div>
                <h4 className="text-base font-bold text-gray-900">{rfq.productName}</h4>
                <p className="text-sm text-gray-500 font-medium mt-0.5">From: {rfq.buyerName}</p>
              </div>
              <span className="bg-amber-50 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap">
                Action Required
              </span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-gray-50 rounded-lg p-4 mb-4">
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Requested Qty</p>
                <p className="text-sm font-bold text-gray-900">{rfq.quantity} units</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Target Price (ea)</p>
                <p className="text-sm font-bold text-gray-900">${rfq.targetPrice.toLocaleString()}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-500 font-medium mb-1">Additional Details</p>
                <p className="text-sm text-gray-700 line-clamp-2">{rfq.details}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-400 font-medium">
                Received: {new Date(rfq.date).toLocaleDateString()}
              </span>
              
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <X className="w-4 h-4" />
                  Reject
                </button>
                <button className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-secondary rounded-lg hover:bg-secondary/90 transition-colors">
                  <FileEdit className="w-4 h-4" />
                  Send Quote
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
