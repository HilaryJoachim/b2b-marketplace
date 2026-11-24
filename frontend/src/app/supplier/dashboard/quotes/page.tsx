"use client";

import React, { useState, useMemo, useEffect, useRef, Suspense } from 'react';
import { Search, Filter, FileText, ChevronRight, Download, Eye, Clock, X, Upload, CheckCircle2, Paperclip, MessageSquare } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSupplierAuth } from '@/context/SupplierAuthContext';
import { supabase } from '@/utils/supabase/client';

const MOCK_QUOTES = [
  { id: 1, name: 'Industrial Grade Stainless Steel Valves', buyer: 'Global Manufacturing Corp.', qty: '500 Units', status: 'pending', date: 1, details: 'Looking for high-pressure industrial valves for our new chemical processing plant. Must be corrosion resistant and rated for at least 1500 PSI. Please include lead time.' },
  { id: 2, name: 'Automatic Thermoforming Machine', buyer: 'PackTech Solutions', qty: '2 Units', status: 'responded', date: 2, details: 'Need fully automatic thermoforming machines capable of handling PET and PP sheets up to 2mm thickness. Our standard mold size is 600x400mm.' },
  { id: 3, name: 'Laundry Dry Cleaning Clothes Packing', buyer: 'CleanCo Services', qty: '100 Pieces', status: 'pending', date: 3, details: 'Require durable clear plastic packing bags for dry cleaning garments. Standard suit length.' },
  { id: 4, name: 'Heavy Duty Packaging Conveyor', buyer: 'Logistics Pro', qty: '1 System', status: 'accepted', date: 4, details: 'Complete motorized roller conveyor system for warehouse packaging line. 20 meters length, adjustable speed.' },
  { id: 5, name: 'Plastic Extrusion Machine', buyer: 'Polymer Works', qty: '1 Unit', status: 'rejected', date: 5, details: 'Single screw extruder for PVC pipe manufacturing. Capacity: 300kg/hr.' },
];

function QuotesContent() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { supplierUser } = useSupplierAuth();
  const isNewUser = supplierUser?.id !== 'sup_demo_001';

  const formatRfqId = (id: any) => {
    if (!id) return 'RFQ-0001';
    if (typeof id === 'number') return `RFQ-${2024000 + id}`;
    return `RFQ-${String(id).replace(/-/g, '').substring(0, 8).toUpperCase()}`;
  };
  
  const [activeModal, setActiveModal] = useState<'none' | 'respond' | 'viewRequest' | 'viewQuote'>('none');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success'>('idle');
  const [dbQuotes, setDbQuotes] = useState<any[]>([]);

  const [quotePrice, setQuotePrice] = useState('');
  const [quoteDeliveryTime, setQuoteDeliveryTime] = useState('');
  const [quoteNotes, setQuoteNotes] = useState('');

  // PDF file attachment state (max 500KB)
  const [selectedPdfFile, setSelectedPdfFile] = useState<File | null>(null);
  const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const searchParams = useSearchParams();
  const router = useRouter();

  const validateAndSetFile = (file?: File) => {
    setFileError('');
    if (!file) return;

    // Must be PDF
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      setFileError('Invalid format. Only PDF files are supported.');
      return;
    }

    // Must be <= 500KB
    const maxBytes = 500 * 1024;
    if (file.size > maxBytes) {
      const sizeKb = (file.size / 1024).toFixed(1);
      setFileError(`File exceeds 500KB limit (selected: ${sizeKb} KB). Please upload a smaller PDF.`);
      return;
    }

    setSelectedPdfFile(file);

    // Read as Base64 Data URL so it is self-contained and viewable
    const reader = new FileReader();
    reader.onload = () => {
      setPdfDataUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    validateAndSetFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  // Fetch real quotes/leads
  useEffect(() => {
    if (!supplierUser) return;

    const fetchQuotes = async () => {
      let query = supabase
        .from('leads')
        .select('*, products(id, title, category, price, image_url)')
        .order('created_at', { ascending: false });

      if (supplierUser.id !== 'sup_demo_001') {
        query = query.or(`supplier_id.eq.${supplierUser.id},supplier_id.is.null`);
      }

      const { data, error } = await query;
      if (data && data.length > 0) {
        const mapped = data.map((lead: any, idx: number) => {
          let details = lead.message;
          let qty = '1 Unit';
          let quotationOffer: any = null;

          try {
            const j = JSON.parse(lead.message);
            if (Array.isArray(j) && j[0]) {
              details = j[0].content || details;
              if (j[0].product?.qty) qty = j[0].product.qty;

              // Extract seller quotation if present
              const qMsg = j.find((m: any) => m.type === 'quotation' || m.quotation);
              if (qMsg) {
                quotationOffer = qMsg.quotation || qMsg;
              }
            }
          } catch (_) {}

          return {
            id: lead.id,
            name: lead.products?.title || 'Product Inquiry',
            buyer: lead.buyer_name || 'Prospective Buyer',
            qty,
            status: quotationOffer ? 'responded' : (lead.unread_count > 0 ? 'pending' : 'responded'),
            date: new Date(lead.created_at).toLocaleDateString(),
            details,
            location: lead.buyer_location || 'Online',
            phone: lead.buyer_phone,
            email: lead.buyer_email,
            quotation: quotationOffer
          };
        });
        setDbQuotes(mapped);
      } else if (supplierUser.id === 'sup_demo_001') {
        setDbQuotes(MOCK_QUOTES);
      } else {
        setDbQuotes([]);
      }
    };

    fetchQuotes();

    // Live real-time updates for quotes
    const channel = supabase
      .channel('supplier_quotes_live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => {
        fetchQuotes();
      })
      .subscribe();

    const interval = setInterval(fetchQuotes, 3000);
    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [supplierUser?.id]);

  useEffect(() => {
    const action = searchParams.get('action');
    const id = searchParams.get('id');

    if (action === 'respond' && id) {
      const quote = dbQuotes.find(q => String(q.id) === String(id)) || MOCK_QUOTES.find(q => String(q.id) === String(id));
      if (quote) {
        setSelectedItem(quote);
        setActiveModal('respond');
        router.replace('/supplier/dashboard/quotes', { scroll: false });
      }
    }
  }, [searchParams, router, dbQuotes]);

  const handleSendQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadStatus('uploading');

    try {
      if (selectedItem?.id) {
        let finalPdfUrl = pdfDataUrl;

        // Attempt upload to Supabase storage if supplier authenticated
        if (selectedPdfFile && supplierUser?.id) {
          try {
            const filePath = `${supplierUser.id}/quotes/${Date.now()}-${selectedPdfFile.name}`;
            const { error: upErr } = await supabase.storage.from('supplier-media').upload(filePath, selectedPdfFile);
            if (!upErr) {
              const { data: { publicUrl } } = supabase.storage.from('supplier-media').getPublicUrl(filePath);
              if (publicUrl) finalPdfUrl = publicUrl;
            }
          } catch (_) {}
        }

        const quotationData = {
          price: quotePrice ? (quotePrice.startsWith('$') ? quotePrice : `$${quotePrice}`) : 'Contact for price',
          deliveryTime: quoteDeliveryTime || 'Standard delivery',
          notes: quoteNotes || '',
          pdfUrl: finalPdfUrl || null,
          pdfName: selectedPdfFile?.name || (finalPdfUrl ? 'Quotation_Proposal.pdf' : null),
          pdfSize: selectedPdfFile ? `${(selectedPdfFile.size / 1024).toFixed(1)} KB` : null,
          createdAt: new Date().toISOString()
        };

        const { data: leadData } = await supabase
          .from('leads')
          .select('message')
          .eq('id', selectedItem.id)
          .single();

        let msgs: any[] = [];
        if (leadData?.message) {
          try {
            const j = JSON.parse(leadData.message);
            if (Array.isArray(j)) msgs = j;
          } catch (_) {}
        }

        const quoteMsg = {
          id: `q_${Date.now()}`,
          type: 'quotation',
          sender: 'seller',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          content: `Official Quotation Offer: ${quotationData.price} (Delivery: ${quotationData.deliveryTime})${quoteNotes ? `\n\nNotes: ${quoteNotes}` : ''}`,
          quotation: quotationData
        };

        msgs.push(quoteMsg);

        await supabase
          .from('leads')
          .update({
            message: JSON.stringify(msgs),
            unread_count: 0 // Supplier has responded and read the inquiry
          })
          .eq('id', selectedItem.id);

        setDbQuotes(prev => prev.map(q => q.id === selectedItem.id ? { 
          ...q, 
          status: 'responded',
          quotation: quotationData
        } : q));
      }
    } catch (err) {
      console.error('Error sending quote response:', err);
    }

    setUploadStatus('success');
    setTimeout(() => {
      setActiveModal('none');
      setQuotePrice('');
      setQuoteDeliveryTime('');
      setQuoteNotes('');
      setSelectedPdfFile(null);
      setPdfDataUrl(null);
      setFileError('');
    }, 1500);
  };

  const filteredQuotes = useMemo(() => {
    return dbQuotes.filter(quote => {
      if (activeTab !== 'all' && quote.status !== activeTab) {
        return false;
      }
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          quote.name.toLowerCase().includes(query) ||
          quote.buyer.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [activeTab, searchQuery, dbQuotes]);

  return (
    <div className="space-y-6 relative">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#002d1b]">Quotes & RFQs</h1>
          <p className="text-gray-500 mt-1">Manage and respond to quote requests (RFQs) received from buyers.</p>
        </div>
      </div>

      {/* Tabs and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between border-b border-gray-100">
          <div className="flex overflow-x-auto">
            {['all', 'pending', 'responded'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors border-b-2 
                  ${activeTab === tab 
                    ? 'border-[#f36a1b] text-[#f36a1b]' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)} Quotes
              </button>
            ))}
          </div>
          
          <div className="p-2 sm:p-3 border-t sm:border-t-0 border-gray-100 flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search quotes..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#f36a1b]/20 focus:border-[#f36a1b] w-full sm:w-64 transition-all"
              />
            </div>
            <button className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quotes List */}
        <div className="divide-y divide-gray-100">
          {filteredQuotes.length === 0 ? (
            <div className="p-16 text-center text-gray-500">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-[#002d1b] mb-1">
                {isNewUser ? "No quotes yet" : "No quotes found"}
              </h3>
              <p className="text-sm max-w-md mx-auto">
                {isNewUser 
                  ? "Buyers will submit Request for Quotes (RFQs) here based on your products. Add more products to your catalog to get started." 
                  : "No quotes match the selected criteria."}
              </p>
            </div>
          ) : (
            filteredQuotes.map((item) => (
              <div key={item.id} className="p-6 hover:bg-gray-50/50 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100">
                        {formatRfqId(item.id)}
                      </span>
                      <span className="flex items-center text-xs text-gray-500">
                        <Clock className="w-3 h-3 mr-1" /> {typeof item.date === 'string' && item.date.includes('/') ? `Requested on ${item.date}` : `Requested ${item.date} days ago`}
                      </span>
                      {item.status === 'pending' && (
                        <span className="bg-orange-100 text-[#f36a1b] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Pending Response
                        </span>
                      )}
                      {item.status === 'responded' && (
                        <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Quote Sent
                        </span>
                      )}
                      {item.status === 'accepted' && (
                        <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Accepted
                        </span>
                      )}
                      {item.status === 'rejected' && (
                        <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Rejected
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-bold text-[#002d1b]">
                      {item.name}
                    </h3>
                    
                    <div className="mt-2 text-sm text-gray-600 flex flex-wrap gap-x-6 gap-y-2">
                      <p><span className="text-gray-400">Buyer:</span> {item.buyer}</p>
                      <p><span className="text-gray-400">Quantity:</span> {item.qty}</p>
                      <p><span className="text-gray-400">Target Date:</span> Sept 15, 2026</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/supplier/dashboard/all-leads?leadId=${item.id}`}
                      className="px-3 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg hover:bg-emerald-100 transition-colors flex items-center text-sm font-medium"
                    >
                      <MessageSquare className="w-4 h-4 mr-1.5" /> Chat
                    </Link>
                    <button 
                      onClick={() => { setSelectedItem(item); setActiveModal('viewRequest'); }}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-[#002d1b] transition-colors flex items-center text-sm font-medium"
                    >
                      <Eye className="w-4 h-4 mr-2" /> View Request
                    </button>
                    {item.status === 'pending' && (
                      <button 
                        onClick={() => { setSelectedItem(item); setUploadStatus('idle'); setActiveModal('respond'); }}
                        className="px-4 py-2 bg-[#f36a1b] text-white rounded-lg hover:bg-[#d95a12] transition-colors flex items-center text-sm font-medium shadow-sm hover:shadow-md"
                      >
                        Attach Quote & Respond <ChevronRight className="w-4 h-4 ml-1" />
                      </button>
                    )}
                    {item.status !== 'pending' && (
                      <button 
                        onClick={() => { setSelectedItem(item); setActiveModal('viewQuote'); }}
                        className="px-4 py-2 bg-white border border-[#f36a1b] text-[#f36a1b] rounded-lg hover:bg-orange-50 transition-colors flex items-center text-sm font-medium"
                      >
                        View Sent Quote
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modals Background Overlay */}
      {activeModal !== 'none' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          
          {/* RESPOND MODAL */}
          {activeModal === 'respond' && (
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div>
                  <h2 className="text-xl font-bold text-[#002d1b]">Respond to Quote Request</h2>
                  <p className="text-sm text-gray-500 mt-1">{formatRfqId(selectedItem?.id)} - {selectedItem?.buyer}</p>
                </div>
                <button onClick={() => setActiveModal('none')} className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleSendQuote} className="p-6 space-y-6">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <h3 className="font-semibold text-gray-800 text-sm mb-2">Requested Product</h3>
                  <p className="text-gray-600 text-sm">{selectedItem?.name}</p>
                  <p className="text-gray-500 text-sm mt-1">Quantity: {selectedItem?.qty}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-semibold text-gray-700">
                      Attach Formal Quote / Proposal Document (PDF)
                    </label>
                    <span className="text-xs text-gray-500 font-medium">Max size: 500KB</span>
                  </div>

                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    accept=".pdf,application/pdf" 
                    onChange={handleFileChange} 
                    className="hidden" 
                  />

                  {!selectedPdfFile ? (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer group ${
                        fileError 
                          ? 'border-red-300 bg-red-50/40 hover:bg-red-50/60' 
                          : isDragging 
                            ? 'border-[#f36a1b] bg-orange-50/60 ring-2 ring-[#f36a1b]/20' 
                            : 'border-gray-200 hover:border-[#f36a1b]/60 hover:bg-gray-50'
                      }`}
                    >
                      <div className="w-12 h-12 bg-orange-100 text-[#f36a1b] rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform shadow-xs">
                        <Upload className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-semibold text-gray-800">
                        Click to upload or drag & drop PDF
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Format: <span className="font-semibold text-gray-700">.PDF only</span> (Maximum size: <span className="font-semibold text-gray-700">500 KB</span>)
                      </p>
                      {fileError && (
                        <p className="mt-2.5 text-xs text-red-600 font-semibold bg-red-100/70 py-1 px-3 rounded-md inline-block">
                          {fileError}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="border border-emerald-200 bg-emerald-50/60 rounded-xl p-4 flex items-center justify-between shadow-xs">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs shrink-0 border border-red-200">
                          PDF
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">
                            {selectedPdfFile.name}
                          </p>
                          <p className="text-xs text-emerald-700 font-medium">
                            {(selectedPdfFile.size / 1024).toFixed(1)} KB &bull; Verified & ready to attach
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          type="button" 
                          onClick={() => fileInputRef.current?.click()}
                          className="text-xs font-semibold text-gray-600 hover:text-gray-900 bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-xs hover:bg-gray-50 transition-colors"
                        >
                          Change
                        </button>
                        <button 
                          type="button" 
                          onClick={() => { setSelectedPdfFile(null); setPdfDataUrl(null); setFileError(''); }}
                          className="text-xs font-semibold text-red-600 hover:text-red-700 bg-white border border-red-200 p-1.5 rounded-lg shadow-xs hover:bg-red-50 transition-colors"
                          aria-label="Remove file"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Message to Buyer (Optional)</label>
                  <textarea 
                    rows={4} 
                    value={quoteNotes}
                    onChange={(e) => setQuoteNotes(e.target.value)}
                    placeholder="Add pricing details, warranty, payment terms, or notes..." 
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#f36a1b]/20 focus:border-[#f36a1b] resize-none"
                  ></textarea>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Total Price Estimate</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                      <input 
                        type="text" 
                        value={quotePrice}
                        onChange={(e) => setQuotePrice(e.target.value)}
                        placeholder="0.00" 
                        className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#f36a1b]/20 focus:border-[#f36a1b]" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Estimated Delivery Time</label>
                    <input 
                      type="text" 
                      value={quoteDeliveryTime}
                      onChange={(e) => setQuoteDeliveryTime(e.target.value)}
                      placeholder="e.g. 14 Days" 
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#f36a1b]/20 focus:border-[#f36a1b]" 
                    />
                  </div>
                </div>
                <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500 italic">A copy of this quotation will be sent to your registered email.</p>
                  <div className="flex gap-3 justify-end">
                    <button type="button" onClick={() => setActiveModal('none')} className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">Cancel</button>
                    <button type="submit" disabled={uploadStatus !== 'idle'} className={`px-5 py-2.5 text-sm font-semibold text-white rounded-lg transition-all flex items-center justify-center cursor-pointer ${uploadStatus === 'success' ? 'bg-green-600' : 'bg-[#002d1b] hover:bg-[#001f12]'} disabled:opacity-80`}>
                      {uploadStatus === 'idle' && <><Paperclip className="w-4 h-4 mr-2" /> Send Quote</>}
                      {uploadStatus === 'uploading' && 'Sending...'}
                      {uploadStatus === 'success' && <><CheckCircle2 className="w-4 h-4 mr-2" /> Sent Successfully</>}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* VIEW REQUEST MODAL */}
          {activeModal === 'viewRequest' && (
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div>
                  <h2 className="text-xl font-bold text-[#002d1b]">Request Details</h2>
                  <p className="text-sm text-gray-500 mt-1">{formatRfqId(selectedItem?.id)}</p>
                </div>
                <button onClick={() => setActiveModal('none')} className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{selectedItem?.name}</h3>
                  <p className="text-sm text-gray-500">Requested by <span className="font-semibold text-gray-700">{selectedItem?.buyer}</span></p>
                </div>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Quantity</p>
                    <p className="text-sm font-medium text-gray-900">{selectedItem?.qty}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Target Date</p>
                    <p className="text-sm font-medium text-gray-900">Sept 15, 2026</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">Request Description</p>
                  <p className="text-sm text-gray-700 leading-relaxed bg-white border border-gray-200 p-4 rounded-xl">
                    {selectedItem?.details}
                  </p>
                </div>
                <div className="pt-4 flex items-center justify-between border-t border-gray-100">
                  <Link
                    href={`/supplier/dashboard/all-leads?leadId=${selectedItem?.id}`}
                    onClick={() => setActiveModal('none')}
                    className="px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg hover:bg-emerald-100 transition-colors flex items-center text-sm font-semibold"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" /> Open Chat Conversation
                  </Link>
                  <div className="flex gap-2">
                    <button onClick={() => setActiveModal('none')} className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg transition-colors">
                      Close
                    </button>
                    {selectedItem?.status === 'pending' && (
                      <button onClick={() => setActiveModal('respond')} className="px-6 py-2 bg-[#f36a1b] hover:bg-[#d95a12] text-white text-sm font-semibold rounded-lg transition-colors">
                        Respond Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW SENT QUOTE MODAL */}
          {activeModal === 'viewQuote' && (
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div>
                  <h2 className="text-xl font-bold text-[#002d1b]">Sent Quote Overview</h2>
                  <p className="text-sm text-gray-500 mt-1">{formatRfqId(selectedItem?.id)} - {selectedItem?.buyer}</p>
                </div>
                <button onClick={() => setActiveModal('none')} className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="bg-green-50 border border-green-200 p-4 rounded-xl flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-green-800">Quote sent successfully</p>
                    <p className="text-xs text-green-700 mt-1">The buyer has been notified and can review your offer. A copy of this quotation has been sent to your email.</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">Attached Document</p>
                    {selectedItem?.quotation?.pdfUrl ? (
                      <a 
                        href={selectedItem.quotation.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={selectedItem.quotation.pdfName || 'Quotation_Proposal.pdf'}
                        className="flex items-center p-3.5 border border-emerald-200 bg-emerald-50/40 rounded-xl hover:bg-emerald-50 transition-colors cursor-pointer group"
                      >
                        <div className="w-10 h-10 bg-red-100 text-red-600 rounded-lg flex items-center justify-center font-bold text-xs mr-3 border border-red-200 shrink-0">
                          PDF
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {selectedItem.quotation.pdfName || 'Quotation_Proposal.pdf'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {selectedItem.quotation.pdfSize || '< 500KB'} &bull; Click to open & view PDF
                          </p>
                        </div>
                        <Download className="w-4 h-4 text-emerald-700 group-hover:scale-110 transition-transform ml-2 shrink-0" />
                      </a>
                    ) : (
                      <div className="p-3 border border-gray-200 rounded-lg bg-gray-50 text-xs text-gray-500 italic">
                        No PDF attached for this quote offer.
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                      <p className="text-xs text-gray-500 mb-1 font-medium">Estimated Price</p>
                      <p className="text-base font-bold text-gray-900">
                        {selectedItem?.quotation?.price || '$12,500.00'}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                      <p className="text-xs text-gray-500 mb-1 font-medium">Delivery Time</p>
                      <p className="text-base font-bold text-gray-900">
                        {selectedItem?.quotation?.deliveryTime || '14 Days'}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">Your Message</p>
                    <p className="text-sm text-gray-700 p-3.5 bg-gray-50 rounded-xl border border-gray-100 whitespace-pre-wrap">
                      {selectedItem?.quotation?.notes || selectedItem?.details || "Quotation submitted to buyer."}
                    </p>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button onClick={() => setActiveModal('none')} className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg transition-colors">
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}

export default function QuotesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading quotes...</div>}>
      <QuotesContent />
    </Suspense>
  );
}
