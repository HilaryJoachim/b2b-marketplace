"use client";

import React, { useState, useEffect } from 'react';
import { FileText, Plus, MessageSquare, ChevronRight, Package, MapPin, Download, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/utils/supabase/client';

export default function BuyerQuotesPage() {
  const { user } = useAuth();
  const [rfqs, setRfqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRfqs = async () => {
      const email = user?.email || (typeof window !== 'undefined' ? localStorage.getItem('kifaru_buyer_email') : null);

      try {
        let query = supabase
          .from('leads')
          .select('*, suppliers(company_name, location), products(title, image_url)')
          .order('created_at', { ascending: false });

        if (email) {
          query = query.ilike('buyer_email', email.trim());
        } else {
          setRfqs([]);
          setLoading(false);
          return;
        }

        const { data, error } = await query;
        if (data && data.length > 0) {
          setRfqs(data);
        } else {
          setRfqs([]);
        }
      } catch (err) {
        console.error('Failed to fetch RFQs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRfqs();

    const channel = supabase
      .channel('buyer_quotes_live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => {
        fetchRfqs();
      })
      .subscribe();

    const interval = setInterval(fetchRfqs, 3000);
    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [user?.email]);

  const extractProduct = (lead: any) => {
    if (lead.message) {
      try {
        const j = JSON.parse(lead.message);
        if (Array.isArray(j) && j.length > 0 && j[0].product) {
          return j[0].product;
        }
      } catch (_) {}
    }
    return lead.products || { title: 'Product Inquiry' };
  };

  const extractQuotation = (lead: any) => {
    if (lead.message) {
      try {
        const j = JSON.parse(lead.message);
        if (Array.isArray(j)) {
          const qMsg = j.find((m: any) => m.type === 'quotation' || m.quotation);
          if (qMsg) return qMsg.quotation || qMsg;
        }
      } catch (_) {}
    }
    return null;
  };

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#002d1b]">My Inquiries & Quotes</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your active Requests for Quotation (RFQs) and seller responses.</p>
        </div>
        <Link 
          href="/" 
          className="bg-[#f36a1b] hover:bg-[#d95a12] text-white px-4 py-2 rounded-xl font-semibold transition-colors flex items-center gap-2 self-start shadow-xs text-sm"
        >
          <Plus className="w-4 h-4" /> Browse Marketplace
        </Link>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400 text-sm">
          Loading your quotes...
        </div>
      ) : rfqs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-xs">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-400 border border-gray-100">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No active quotes yet</h3>
          <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
            You haven't requested any quotations yet. Browse product pages and click "Get Quote" or "Contact Seller" to receive direct quotes.
          </p>
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 bg-[#002d1b] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#084C41] transition-colors"
          >
            Explore Products
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs divide-y divide-gray-100 overflow-hidden">
          {rfqs.map((rfq) => {
            const product = extractProduct(rfq);
            const quotation = extractQuotation(rfq);
            const supplierName = rfq.suppliers?.company_name || 'Verified Supplier';
            const dateStr = new Date(rfq.created_at).toLocaleDateString();

            return (
              <div key={rfq.id} className="p-6 hover:bg-gray-50/60 transition-colors flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      {quotation ? (
                        <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Formal Quote Received
                        </span>
                      ) : (
                        <span className="bg-orange-50 text-[#f36a1b] border border-orange-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Awaiting Quote
                        </span>
                      )}
                      <span className="text-xs text-gray-400 font-medium">
                        Submitted on {dateStr}
                      </span>
                    </div>

                    <h3 className="font-bold text-gray-900 text-lg mb-1">
                      {product.title || 'Product Inquiry'}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                      <span className="font-semibold text-gray-800">Supplier: {supplierName}</span>
                      {rfq.buyer_location && (
                        <span className="flex items-center">
                          <MapPin className="w-3.5 h-3.5 mr-1 text-gray-400" /> {rfq.buyer_location}
                        </span>
                      )}
                      {product.qty && (
                        <span className="flex items-center">
                          <Package className="w-3.5 h-3.5 mr-1 text-gray-400" /> {product.qty}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <Link 
                      href={`/buyer/dashboard/messages?chatId=${rfq.id}`}
                      className="inline-flex items-center gap-1.5 bg-white border border-gray-300 hover:border-[#f36a1b] hover:text-[#f36a1b] text-gray-700 px-4 py-2 rounded-xl text-xs font-semibold transition-colors shadow-xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Open Chat <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                    </Link>
                  </div>
                </div>

                {/* Quotation Offer Banner if seller responded */}
                {quotation && (
                  <div className="mt-2 bg-gradient-to-r from-emerald-50 to-teal-50/60 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Offered Price:</span>
                        <span className="text-lg font-extrabold text-emerald-700">{quotation.price}</span>
                        {quotation.deliveryTime && (
                          <span className="text-xs text-gray-600 bg-white/80 px-2 py-0.5 rounded-md border border-emerald-200/60 ml-2">
                            Est. Delivery: {quotation.deliveryTime}
                          </span>
                        )}
                      </div>
                      {quotation.notes && (
                        <p className="text-xs text-gray-600 italic">
                          "{quotation.notes}"
                        </p>
                      )}
                    </div>

                    {quotation.pdfUrl && (
                      <a 
                        href={quotation.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={quotation.pdfName || 'Formal_Quotation.pdf'}
                        className="inline-flex items-center gap-2 bg-[#002d1b] hover:bg-[#084C41] text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition-colors shrink-0 cursor-pointer"
                      >
                        <FileText className="w-4 h-4 text-orange-400" />
                        <span>View / Download Proposal ({quotation.pdfSize || '<500KB'})</span>
                        <Download className="w-3.5 h-3.5 ml-1" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
