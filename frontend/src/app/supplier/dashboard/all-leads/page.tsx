"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { 
  Search, 
  MoreVertical, 
  MapPin, 
  MessageSquareText, 
  Users, 
  Globe2, 
  PhoneMissed,
  Phone,
  Mail,
  Send,
  Package,
  Info,
  FileText,
  Download
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useSupplierAuth } from '@/context/SupplierAuthContext';
import { supabase } from '@/utils/supabase/client';

export default function AllLeadsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading messages...</div>}>
      <AllLeadsContent />
    </Suspense>
  );
}

function AllLeadsContent() {
  const [activeTab, setActiveTab] = useState('All');
  const [selectedLeadId, setSelectedLeadId] = useState<string | number | null>(null);
  const selectedLeadIdRef = useRef<string | number | null>(null);
  
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { supplierUser } = useSupplierAuth();
  const searchParams = useSearchParams();
  const queryLeadId = searchParams.get('leadId');

  // Keep ref synchronized with state
  useEffect(() => {
    selectedLeadIdRef.current = selectedLeadId;
  }, [selectedLeadId]);

  // Mark lead as read both in state and in Supabase
  const markLeadAsRead = async (leadId: string | number) => {
    if (!leadId) return;

    // Immediately clear in local state
    setLeads(prev => prev.map(l => String(l.id) === String(leadId) ? { ...l, unreadCount: 0 } : l));

    // Persist to Supabase so it stays read
    if (supplierUser?.id !== 'sup_demo_001') {
      try {
        await supabase
          .from('leads')
          .update({ unread_count: 0 })
          .eq('id', leadId);
      } catch (err) {
        console.error('Failed to mark lead as read:', err);
      }
    }
  };

  // When selectedLeadId is set, mark it as read immediately
  useEffect(() => {
    if (selectedLeadId) {
      markLeadAsRead(selectedLeadId);
    }
  }, [selectedLeadId]);

  // Helper to parse lead messages
  const parseMessages = (lead: any) => {
    let parsed: any[] = [];
    if (lead.message) {
      try {
        const j = JSON.parse(lead.message);
        if (Array.isArray(j)) {
          parsed = j;
        }
      } catch (_) {}
    }
    if (parsed.length === 0 && lead.message) {
      parsed = [
        {
          id: `m_${lead.id}`,
          type: lead.is_product_inquiry ? 'product_inquiry' : 'text',
          sender: 'buyer',
          timestamp: new Date(lead.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          content: lead.message,
          product: lead.products ? {
            id: lead.products.id,
            title: lead.products.title,
            category: lead.products.category,
            targetPrice: lead.products.price ? `$${lead.products.price}` : 'Inquiry',
            qty: '1 Unit'
          } : (lead.product_id ? {
            title: `Product #${lead.product_id}`,
            category: 'General',
            targetPrice: 'Contact for price',
            qty: '1 Unit'
          } : null)
        }
      ];
    }
    return parsed;
  };

  // Fetch leads function
  const fetchLeads = async () => {
    if (!supplierUser) return;

    try {
      // Check for real leads in Supabase
      let query = supabase
        .from('leads')
        .select('*, products(id, title, category, price, image_url)')
        .order('created_at', { ascending: false });

      if (supplierUser.id !== 'sup_demo_001') {
        // Match this supplier's ID or unassigned leads
        query = query.or(`supplier_id.eq.${supplierUser.id},supplier_id.is.null`);
      }

      const { data, error } = await query;

      if (data && data.length > 0) {
        const mappedLeads = data.map((lead: any) => {
          const msgs = parseMessages(lead);
          const initials = (lead.buyer_name || 'Buyer').substring(0, 2).toUpperCase();
          const avatarColors = [
            'bg-emerald-100 text-emerald-700',
            'bg-blue-100 text-blue-700',
            'bg-teal-100 text-teal-700',
            'bg-orange-100 text-orange-700',
            'bg-purple-100 text-purple-700'
          ];
          const colorIndex = Math.abs(lead.id.charCodeAt(0) || 0) % avatarColors.length;

          const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1] : null;
          const isSelected = String(selectedLeadIdRef.current) === String(lead.id);

          // Lead is only unread for seller if:
          // 1. It is NOT currently selected/open
          // 2. Database unread_count > 0
          // 3. The last message was NOT sent by the seller
          const isUnreadForSeller = !isSelected && (lead.unread_count > 0) && (!lastMsg || lastMsg.sender !== 'seller');
          const unreadCount = isUnreadForSeller ? (lead.unread_count || 1) : 0;

          return {
            id: lead.id,
            name: lead.buyer_name || 'Prospective Buyer',
            location: lead.buyer_location || 'Online',
            email: lead.buyer_email || 'Not provided',
            phone: lead.buyer_phone || 'Not provided',
            initials,
            avatarColor: avatarColors[colorIndex],
            unreadCount,
            date: new Date(lead.created_at).toLocaleDateString(),
            snippet: msgs[msgs.length - 1]?.content || 'New inquiry received',
            messages: msgs
          };
        });

        setLeads(mappedLeads);

        // Auto-select query lead or first lead if nothing selected
        if (queryLeadId) {
          setSelectedLeadId(queryLeadId);
          markLeadAsRead(queryLeadId);
        } else if (!selectedLeadId && mappedLeads.length > 0) {
          setSelectedLeadId(mappedLeads[0].id);
          markLeadAsRead(mappedLeads[0].id);
        } else if (selectedLeadIdRef.current) {
          // If the currently open lead has unread_count > 0 in DB, mark it read in Supabase
          const currentLeadInDb = data.find((l: any) => String(l.id) === String(selectedLeadIdRef.current));
          if (currentLeadInDb && currentLeadInDb.unread_count > 0) {
            markLeadAsRead(currentLeadInDb.id);
          }
        }
      } else if (supplierUser.id === 'sup_demo_001') {
        // Fallback for demo account
        const res = await fetch('/api/messages');
        const demoData = await res.json();
        setLeads(demoData);
        if (!selectedLeadId && demoData.length > 0) {
          setSelectedLeadId(demoData[0].id);
        }
      } else {
        setLeads([]);
      }
    } catch (err) {
      console.error('Failed to fetch leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();

    // Subscribe to live Realtime updates on leads table
    const channel = supabase
      .channel('supplier_leads_live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => {
        fetchLeads();
      })
      .subscribe();

    // Poll every 3 seconds as resilient backup
    const interval = setInterval(fetchLeads, 3000);
    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [supplierUser?.id, queryLeadId]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedLeadId, leads]);

  const selectedLead = leads.find(l => String(l.id) === String(selectedLeadId));

  const filteredLeads = leads.filter(lead => {
    if (activeTab === 'Unread') return lead.unreadCount > 0;
    return true; 
  });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedLeadId || sending) return;

    setSending(true);
    const content = messageInput.trim();
    setMessageInput('');

    const newMsg = {
      id: `m_${Date.now()}`,
      type: 'text',
      sender: 'seller',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content
    };

    const currentLead = leads.find(l => String(l.id) === String(selectedLeadId));
    const updatedMessages = [...(currentLead?.messages || []), newMsg];

    // Optimistically update UI
    setLeads(prev => prev.map(lead => {
      if (String(lead.id) === String(selectedLeadId)) {
        return {
          ...lead,
          unreadCount: 0,
          messages: updatedMessages
        };
      }
      return lead;
    }));

    try {
      if (supplierUser?.id === 'sup_demo_001') {
        await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            leadId: selectedLeadId,
            message: content,
            senderType: 'seller'
          })
        });
      } else {
        // Save conversation thread into Supabase `leads` table
        const { error } = await supabase
          .from('leads')
          .update({
            message: JSON.stringify(updatedMessages),
            unread_count: 0
          })
          .eq('id', selectedLeadId);

        if (error) {
          console.error('Failed to save message in Supabase:', error);
        }
      }
    } catch (err) {
      console.error('Send error:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="h-[calc(100vh-60px)] flex bg-white overflow-hidden">
      
      {/* Left Pane: Lead List */}
      <div className="w-full md:w-[380px] lg:w-[420px] flex-shrink-0 border-r border-gray-200 flex flex-col bg-white h-full relative z-10">
        
        {/* Header & Search */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold text-[#002d1b]">Messages & Inquiries</h1>
            <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
              {leads.length} Active {leads.length === 1 ? 'Lead' : 'Leads'}
            </span>
          </div>
          
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search conversations..."
              className="block w-full pl-10 pr-3 py-2.5 border border-transparent bg-gray-100 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:bg-white focus:border-[#f36a1b] focus:ring-1 focus:ring-[#f36a1b] transition-colors"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            {['All', 'Unread'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                  activeTab === tab 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-400 text-sm">Loading conversations...</div>
          ) : filteredLeads.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-sm">
              <MessageSquareText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="font-semibold text-gray-700">No inquiries yet</p>
              <p className="text-xs text-gray-400 mt-1">Inquiries from buyers will appear here in real time.</p>
            </div>
          ) : (
            filteredLeads.map((lead) => {
              const lastMessage = lead.messages && lead.messages.length > 0 
                ? lead.messages[lead.messages.length - 1] 
                : null;
                
              const snippet = lastMessage 
                ? (lastMessage.content || `Inquiry: ${lastMessage.product?.title || 'Product'}`)
                : lead.snippet;

              const isSelected = String(selectedLeadId) === String(lead.id);
              const hasUnread = !isSelected && lead.unreadCount > 0;

              return (
                <div 
                  key={lead.id}
                  onClick={() => {
                    setSelectedLeadId(lead.id);
                    markLeadAsRead(lead.id);
                  }}
                  className={`p-4 border-b border-gray-50 cursor-pointer transition-colors flex gap-3 hover:bg-gray-50 ${
                    isSelected ? 'bg-orange-50/50 border-l-4 border-l-[#f36a1b]' : 'bg-white'
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${lead.avatarColor}`}>
                      {lead.initials}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-0.5">
                      <h3 className="font-bold text-gray-900 truncate text-sm">{lead.name}</h3>
                      <span className={`text-xs font-semibold shrink-0 ml-2 ${hasUnread ? 'text-[#f36a1b] font-bold' : 'text-gray-400'}`}>
                        {lead.date}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-xs text-gray-500 mb-1">
                      <MapPin className="w-3 h-3 mr-1 shrink-0 text-gray-400" />
                      <span className="truncate">{lead.location}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 truncate mr-2 flex items-center">
                        {snippet}
                      </p>
                      {hasUnread && (
                        <div className="w-5 h-5 bg-[#f36a1b] rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-sm">
                          {lead.unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Pane: Chat / Empty State */}
      <div className="hidden md:flex flex-1 flex-col relative bg-[#f5f7fa] overflow-hidden">
        
        {/* Subtle Background Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03] z-0 pointer-events-none"
          style={{ 
            backgroundImage: 'radial-gradient(#002d1b 2px, transparent 2px)', 
            backgroundSize: '30px 30px' 
          }}
        ></div>

        {selectedLead ? (
          // Active Chat View
          <div className="relative z-10 flex flex-col h-full w-full max-w-4xl mx-auto border-l border-r border-gray-100 bg-white/70 backdrop-blur-sm shadow-xl">
            
            {/* Chat Header & Buyer Details */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 shrink-0 flex items-center justify-between z-20 shadow-xs">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${selectedLead.avatarColor}`}>
                  {selectedLead.initials}
                </div>
                <div>
                  <h2 className="font-bold text-[#002d1b] text-lg leading-tight flex items-center gap-2">
                    {selectedLead.name}
                  </h2>
                  <p className="text-sm text-gray-500 flex items-center mt-0.5">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-gray-400" /> {selectedLead.location}
                  </p>
                </div>
              </div>
              
              {/* Buyer Contact Info Panel */}
              <div className="hidden lg:flex items-center gap-3 border-l border-gray-200 pl-4 ml-4">
                <div className="flex flex-col gap-1.5 text-xs text-gray-600">
                  <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                    <Phone className="w-3.5 h-3.5 mr-2 text-[#f36a1b]" />
                    <span className="font-medium text-gray-800">{selectedLead.phone}</span>
                  </div>
                  <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                    <Mail className="w-3.5 h-3.5 mr-2 text-[#f36a1b]" />
                    <span className="font-medium text-gray-800">{selectedLead.email}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Direct Reach Alert */}
              <div className="flex justify-center mb-6">
                <div className="bg-emerald-50 text-emerald-800 border border-emerald-100 text-xs px-4 py-2 rounded-full flex items-center shadow-xs">
                  <Info className="w-4 h-4 mr-2 text-emerald-600" />
                  Buyer verified. You can exchange messages here or contact them via phone/email directly.
                </div>
              </div>

              {selectedLead.messages?.map((msg: any) => {
                const isBuyer = msg.sender === 'buyer';
                
                return (
                  <div key={msg.id} className={`flex flex-col ${isBuyer ? 'items-start' : 'items-end'}`}>
                    
                    {/* Sender & Timestamp */}
                    <span className="text-[10px] text-gray-400 font-medium mb-1 px-1">
                      {isBuyer ? selectedLead.name : 'You (Seller)'} &bull; {msg.timestamp}
                    </span>
                    
                    {/* Render Product Inquiry Card if attached */}
                    {msg.type === 'product_inquiry' && msg.product && (
                      <div className="max-w-[85%] sm:max-w-md bg-white border border-orange-200 shadow-sm rounded-2xl rounded-tl-sm p-4 mb-2">
                        <div className="flex items-center gap-2 mb-2 border-b border-gray-100 pb-2">
                          <Package className="w-4 h-4 text-[#f36a1b]" />
                          <span className="text-xs font-bold text-[#f36a1b] uppercase tracking-wide">Product Inquiry</span>
                        </div>
                        <h4 className="font-bold text-[#002d1b] text-base leading-tight mb-2">
                          {msg.product.title}
                        </h4>
                        <div className="space-y-1 text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                          {msg.product.category && <p><span className="font-semibold text-gray-800">Category:</span> {msg.product.category}</p>}
                          {msg.product.qty && <p><span className="font-semibold text-gray-800">Quantity:</span> {msg.product.qty}</p>}
                          {msg.product.targetPrice && <p><span className="font-semibold text-gray-800">Price Target:</span> {msg.product.targetPrice}</p>}
                        </div>
                      </div>
                    )}

                    {/* Render Formal Quotation Card if present */}
                    {(msg.type === 'quotation' || msg.quotation) && (
                      <div className="max-w-[85%] sm:max-w-md bg-gradient-to-br from-emerald-50 to-white border border-emerald-300 shadow-sm rounded-2xl p-4 mb-2 text-left">
                        <div className="flex items-center justify-between gap-2 mb-2 border-b border-emerald-100 pb-2">
                          <div className="flex items-center gap-1.5 text-emerald-800">
                            <FileText className="w-4 h-4 text-emerald-600" />
                            <span className="text-xs font-bold uppercase tracking-wide">Official Quotation Sent</span>
                          </div>
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                            Verified Proposal
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div className="bg-white p-2.5 rounded-lg border border-emerald-100 shadow-2xs">
                            <span className="text-[11px] text-gray-500 font-medium block">Price Quoted</span>
                            <span className="text-sm font-extrabold text-emerald-700">{msg.quotation?.price || 'Negotiable'}</span>
                          </div>
                          <div className="bg-white p-2.5 rounded-lg border border-emerald-100 shadow-2xs">
                            <span className="text-[11px] text-gray-500 font-medium block">Estimated Delivery</span>
                            <span className="text-sm font-bold text-gray-900">{msg.quotation?.deliveryTime || 'Standard'}</span>
                          </div>
                        </div>

                        {msg.quotation?.notes && (
                          <div className="text-xs text-gray-700 bg-white p-2.5 rounded-lg border border-emerald-100 mb-3 whitespace-pre-wrap">
                            {msg.quotation.notes}
                          </div>
                        )}

                        {msg.quotation?.pdfUrl && (
                          <a
                            href={msg.quotation.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={msg.quotation.pdfName || 'Quotation_Proposal.pdf'}
                            className="w-full flex items-center justify-between p-2.5 bg-[#002d1b] hover:bg-[#084C41] text-white rounded-xl text-xs font-semibold transition-all shadow-xs group cursor-pointer"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="px-1.5 py-0.5 bg-red-500 text-white font-bold text-[10px] rounded">PDF</span>
                              <span className="truncate">{msg.quotation.pdfName || 'Formal_Proposal.pdf'}</span>
                              {msg.quotation.pdfSize && (
                                <span className="text-white/60 text-[10px]">({msg.quotation.pdfSize})</span>
                              )}
                            </div>
                            <Download className="w-3.5 h-3.5 shrink-0 group-hover:scale-110 transition-transform ml-2" />
                          </a>
                        )}
                      </div>
                    )}

                    {/* Message Bubble */}
                    {msg.content && msg.type !== 'quotation' && (
                      <div 
                        className={`max-w-[85%] sm:max-w-md px-5 py-3 shadow-xs ${
                          isBuyer 
                            ? 'bg-white border border-gray-200/80 text-gray-900 rounded-2xl rounded-tl-sm' 
                            : 'bg-[#002d1b] text-white rounded-2xl rounded-tr-sm'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      </div>
                    )}
                    
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Area */}
            <div className="bg-white border-t border-gray-200 p-4 shrink-0 z-20">
              <form onSubmit={handleSendMessage} className="flex gap-3">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type your response to the buyer..."
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#f36a1b]/20 focus:border-[#f36a1b] transition-all"
                  disabled={sending}
                />
                <button 
                  type="submit" 
                  disabled={!messageInput.trim() || sending}
                  className="bg-[#f36a1b] hover:bg-[#d95a12] text-white px-5 py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center justify-center shrink-0 font-semibold gap-1.5 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </form>
              <div className="mt-2 text-center">
                <p className="text-[10px] text-gray-400">Replies are sent directly to the buyer's portal.</p>
              </div>
            </div>

          </div>
        ) : (
          // Empty Welcome State
          <div className="relative z-10 flex flex-col items-center justify-center text-center p-8 h-full max-w-lg mx-auto">
            <h2 className="text-2xl font-bold text-[#002d1b] mb-2">
              Welcome, <span className="text-[#f36a1b]">{supplierUser?.companyName || supplierUser?.name || 'Seller'}</span>
            </h2>
            <p className="text-gray-500 text-sm mb-8">
              Select a conversation from the left to view buyer requirements and respond.
            </p>

            <div className="w-16 h-16 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mx-auto mb-4 text-[#002d1b]">
              <Users className="w-8 h-8" />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
