"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { 
  Search, 
  MoreVertical, 
  MapPin, 
  MessageSquareText, 
  Store, 
  Send, 
  Package, 
  ShieldCheck,
  Phone,
  Mail,
  Info,
  FileText,
  Download
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/utils/supabase/client';

export default function BuyerMessagesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading messages...</div>}>
      <BuyerMessagesContent />
    </Suspense>
  );
}

function BuyerMessagesContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const queryChatId = searchParams.get('chatId');

  const [activeTab, setActiveTab] = useState('All');
  const [selectedChatId, setSelectedChatId] = useState<string | number | null>(null);
  
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
          } : null
        }
      ];
    }
    return parsed;
  };

  // Fetch buyer's chats
  const fetchChats = async () => {
    const buyerEmail = user?.email || (typeof window !== 'undefined' ? localStorage.getItem('kifaru_buyer_email') : null);

    try {
      let query = supabase
        .from('leads')
        .select('*, suppliers(id, name, company_name, location, logo_url, phone, email), products(id, title, category, price, image_url)')
        .order('created_at', { ascending: false });

      if (buyerEmail) {
        query = query.ilike('buyer_email', buyerEmail.trim());
      } else {
        setChats([]);
        setLoading(false);
        return;
      }

      const { data, error } = await query;

      if (data && data.length > 0) {
        const mappedChats = data.map((lead: any) => {
          const msgs = parseMessages(lead);
          const supplierName = lead.suppliers?.company_name || lead.suppliers?.name || 'Verified Supplier';

          return {
            id: lead.id,
            name: supplierName,
            location: lead.suppliers?.location || 'Verified Business',
            supplierEmail: lead.suppliers?.email || 'supplier@marketplace.com',
            supplierPhone: lead.suppliers?.phone || 'Contact via chat',
            date: new Date(lead.created_at).toLocaleDateString(),
            unreadCount: 0,
            snippet: msgs[msgs.length - 1]?.content || 'Inquiry sent',
            messages: msgs
          };
        });

        setChats(mappedChats);

        // Auto select
        if (queryChatId) {
          setSelectedChatId(queryChatId);
        } else if (!selectedChatId && mappedChats.length > 0) {
          setSelectedChatId(mappedChats[0].id);
        }
      } else {
        setChats([]);
      }
    } catch (err) {
      console.error('Failed to fetch buyer chats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();

    // Subscribe to live Realtime updates on leads table for instant message delivery
    const channel = supabase
      .channel('buyer_leads_live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => {
        fetchChats();
      })
      .subscribe();

    const interval = setInterval(fetchChats, 3000);
    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [user?.email, queryChatId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedChatId, chats]);

  const selectedChat = chats.find(c => String(c.id) === String(selectedChatId));

  const filteredChats = chats.filter(chat => {
    if (activeTab === 'Unread') return chat.unreadCount > 0;
    return true; 
  });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedChatId || sending) return;

    setSending(true);
    const content = messageInput.trim();
    setMessageInput('');

    const newMsg = {
      id: `m_${Date.now()}`,
      type: 'text',
      sender: 'buyer',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content
    };

    const currentChat = chats.find(c => String(c.id) === String(selectedChatId));
    const updatedMessages = [...(currentChat?.messages || []), newMsg];

    // Optimistically update UI
    setChats(prev => prev.map(chat => {
      if (String(chat.id) === String(selectedChatId)) {
        return {
          ...chat,
          messages: updatedMessages
        };
      }
      return chat;
    }));

    try {
      // Save updated thread in Supabase leads
      const { error } = await supabase
        .from('leads')
        .update({
          message: JSON.stringify(updatedMessages),
          unread_count: 1 // Notify supplier that buyer sent a new message!
        })
        .eq('id', selectedChatId);

      if (error) {
        console.error('Failed to update conversation:', error);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="h-full flex bg-white overflow-hidden rounded-2xl border border-gray-200/80 shadow-xs" style={{ height: 'calc(100vh - 120px)', margin: '16px' }}>
      
      {/* Left Pane: Chat List */}
      <div className="w-full md:w-[350px] lg:w-[380px] flex-shrink-0 border-r border-gray-200 flex flex-col bg-white h-full relative z-10">
        
        {/* Header & Search */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex justify-between items-center mb-3">
            <h1 className="text-xl font-bold text-[#002d1b]">Conversations</h1>
            <span className="text-xs font-semibold px-2 py-0.5 bg-orange-50 text-[#f36a1b] rounded-full border border-orange-100">
              {chats.length} {chats.length === 1 ? 'Supplier' : 'Suppliers'}
            </span>
          </div>
          
          <div className="relative mb-3">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search conversations..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 bg-gray-50 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#f36a1b] focus:ring-1 focus:ring-[#f36a1b] transition-colors"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            {['All', 'Active'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
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
          ) : filteredChats.length === 0 ? (
            <div className="p-10 text-center text-gray-400 text-sm">
              <MessageSquareText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="font-semibold text-gray-700">No inquiries sent yet</p>
              <p className="text-xs text-gray-400 mt-1">When you contact a supplier or request a quote, your conversation will appear here.</p>
            </div>
          ) : (
            filteredChats.map((chat) => {
              const lastMessage = chat.messages && chat.messages.length > 0 
                ? chat.messages[chat.messages.length - 1] 
                : null;
                
              const snippet = lastMessage 
                ? (lastMessage.content || `Inquiry: ${lastMessage.product?.title || 'Product'}`)
                : chat.snippet;

              const isSelected = String(selectedChatId) === String(chat.id);

              return (
                <div 
                  key={chat.id}
                  onClick={() => setSelectedChatId(chat.id)}
                  className={`p-4 border-b border-gray-100 cursor-pointer transition-colors flex gap-3 hover:bg-gray-50 ${
                    isSelected ? 'bg-orange-50/50 border-l-4 border-l-[#f36a1b]' : 'bg-white'
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-base bg-orange-100 text-[#f36a1b] border border-orange-200/60">
                      <Store className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-0.5">
                      <h3 className="font-bold text-gray-900 truncate text-sm">{chat.name}</h3>
                      <span className="text-[11px] font-medium text-gray-400 shrink-0 ml-2">
                        {chat.date}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-xs text-gray-500 mb-1">
                      <ShieldCheck className="w-3.5 h-3.5 mr-1 shrink-0 text-emerald-600" />
                      <span className="truncate">{chat.location}</span>
                    </div>
                    
                    <p className="text-xs text-gray-600 truncate">
                      {snippet}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Pane: Chat / Empty State */}
      <div className="hidden md:flex flex-1 flex-col relative bg-[#f5f7fa] overflow-hidden">
        
        {selectedChat ? (
          // Active Chat View
          <div className="relative z-10 flex flex-col h-full w-full max-w-4xl mx-auto border-l border-r border-gray-200/70 bg-white/70 backdrop-blur-sm shadow-xs">
            
            {/* Chat Header & Supplier Details */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 shrink-0 flex items-center justify-between z-20 shadow-xs">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-base bg-orange-100 text-[#f36a1b] border border-orange-200/60">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-[#002d1b] text-base leading-tight flex items-center gap-1.5">
                    {selectedChat.name}
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  </h2>
                  <p className="text-xs text-gray-500 flex items-center mt-0.5">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-gray-400" /> {selectedChat.location}
                  </p>
                </div>
              </div>
              
              {/* Supplier Info */}
              <div className="hidden lg:flex items-center gap-3 border-l border-gray-200 pl-4 ml-4">
                <div className="flex flex-col gap-1 text-xs text-gray-600">
                  <div className="flex items-center bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
                    <Phone className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                    <span>{selectedChat.supplierPhone}</span>
                  </div>
                  <div className="flex items-center bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
                    <Mail className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                    <span>{selectedChat.supplierEmail}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              <div className="flex justify-center mb-4">
                <div className="bg-emerald-50 text-emerald-800 border border-emerald-100 text-xs px-4 py-2 rounded-full flex items-center shadow-xs">
                  <Info className="w-4 h-4 mr-2 text-emerald-600" />
                  You are chatting directly with {selectedChat.name}. Inquiries and quotes are recorded.
                </div>
              </div>

              {selectedChat.messages?.map((msg: any) => {
                const isMe = msg.sender === 'buyer';
                
                return (
                  <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    
                    {/* Sender Name & Timestamp */}
                    <span className="text-[10px] text-gray-400 font-medium mb-1 px-1">
                      {isMe ? 'You (Buyer)' : selectedChat.name} &bull; {msg.timestamp}
                    </span>
                    
                    {/* Render Product Inquiry Card if present */}
                    {msg.type === 'product_inquiry' && msg.product && (
                      <div className="max-w-[85%] sm:max-w-md bg-white border border-orange-200 shadow-sm rounded-2xl rounded-tl-sm p-4 mb-2">
                        <div className="flex items-center gap-2 mb-2 border-b border-gray-100 pb-2">
                          <Package className="w-4 h-4 text-[#f36a1b]" />
                          <span className="text-xs font-bold text-[#f36a1b] uppercase tracking-wide">Inquiry Details</span>
                        </div>
                        <h4 className="font-bold text-[#002d1b] text-sm leading-tight mb-2">
                          {msg.product.title}
                        </h4>
                        <div className="space-y-1 text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                          {msg.product.category && <p><span className="font-semibold text-gray-800">Category:</span> {msg.product.category}</p>}
                          {msg.product.qty && <p><span className="font-semibold text-gray-800">Quantity:</span> {msg.product.qty}</p>}
                          {msg.product.targetPrice && <p><span className="font-semibold text-gray-800">Target Price:</span> {msg.product.targetPrice}</p>}
                          {msg.product.specs && <p><span className="font-semibold text-gray-800">Specs:</span> {msg.product.specs}</p>}
                        </div>
                      </div>
                    )}

                    {/* Render Formal Quotation Card if present */}
                    {(msg.type === 'quotation' || msg.quotation) && (
                      <div className="max-w-[85%] sm:max-w-md bg-gradient-to-br from-emerald-50 to-white border border-emerald-300 shadow-sm rounded-2xl p-4 mb-2">
                        <div className="flex items-center justify-between gap-2 mb-2 border-b border-emerald-100 pb-2">
                          <div className="flex items-center gap-1.5 text-emerald-800">
                            <FileText className="w-4 h-4 text-emerald-600" />
                            <span className="text-xs font-bold uppercase tracking-wide">Official Quotation Offer</span>
                          </div>
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                            Verified Proposal
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div className="bg-white p-2.5 rounded-lg border border-emerald-100 shadow-2xs">
                            <span className="text-[11px] text-gray-500 font-medium block">Price Estimate</span>
                            <span className="text-sm font-extrabold text-emerald-700">{msg.quotation?.price || 'Negotiable'}</span>
                          </div>
                          <div className="bg-white p-2.5 rounded-lg border border-emerald-100 shadow-2xs">
                            <span className="text-[11px] text-gray-500 font-medium block">Delivery Time</span>
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
                          isMe 
                            ? 'bg-[#002d1b] text-white rounded-2xl rounded-tr-sm' 
                            : 'bg-white border border-gray-200 text-gray-900 rounded-2xl rounded-tl-sm'
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
                  placeholder="Type a message to the supplier..."
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
                <p className="text-[10px] text-gray-400">Direct message to seller. Response time is typically within a few hours.</p>
              </div>
            </div>

          </div>
        ) : (
          // Empty State
          <div className="relative z-10 flex flex-col items-center justify-center text-center p-8 h-full max-w-lg mx-auto">
            <div className="w-16 h-16 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mx-auto mb-4 text-[#002d1b]">
              <MessageSquareText className="w-8 h-8 text-[#f36a1b]" />
            </div>
            <h2 className="text-xl font-bold text-[#002d1b] mb-1">
              Your Marketplace Messages
            </h2>
            <p className="text-gray-500 text-sm">
              Select an inquiry on the left to review quotes and continue conversations with sellers.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
