"use client";

import React from 'react';
import { FileText, Plus } from 'lucide-react';

export default function BuyerQuotesPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#002d1b]">My Quotes & RFQs</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your active Requests for Quotation.</p>
        </div>
        <button className="bg-[#f36a1b] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#d95a12] transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" /> New RFQ
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
          <FileText className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">No active quotes</h3>
        <p className="text-gray-500 max-w-sm mx-auto">
          You haven't requested any formal quotations yet. Browse the marketplace and submit an RFQ to get started.
        </p>
      </div>
    </div>
  );
}
