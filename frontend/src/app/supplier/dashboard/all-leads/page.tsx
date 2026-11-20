"use client";

import React, { useState, useEffect, useRef } from 'react';
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
  Info
} from 'lucide-react';
import { useSupplierAuth } from '@/context/SupplierAuthContext';
import { supabase } from '@/utils/supabase/client';

export default function AllLeadsPage() {
  const [activeTab, setActiveTab] = useState('All');
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
  
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { supplierUser } = useSupplierAuth();

  // Fetch leads from Supabase
  useEffect(() => {
    if (!supplierUser) return;
    
    if (supplierUser.id === 'sup_demo_001') {
      fetch('/api/messages')
        .then(res => res.json())
        .then(data => {
          setLeads(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to fetch messages:', err);
          setLoading(false);
        });
      return;
    }

    supabase.from('leads').select('*').eq('supplier_id', supplierUser.id).order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (data) {
          const mappedLeads = data.map((lead: any) => ({
            id: lead.id,
            name: lead.buyer_name || 'Unknown Buyer',
            location: 'Online',
            email: lead.buyer_email,
            phone: lead.buyer_phone,
            initials: (lead.buyer_name || 'U').substring(0, 2).toUpperCase(),
            avatarColor: 'bg-emerald-100 text-emerald-700',
            unreadCount: 1,
            date: new Date(lead.created_at).toLocaleDateString(),
            snippet: lead.message || 'New Inquiry',
            messages: [
              {
                id: lead.id,
                type: lead.product_id ? 'product_inquiry' : 'text',
                sender: 'buyer',
                timestamp: new Date(lead.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                content: lead.message,
                product: lead.product_id ? { title: "Product Inquiry (ID: " + lead.product_id + ")", category: "General", specs: "N/A", targetPrice: "N/A", qty: "1" } : null,
              }
            ]
          }));
          setLeads(mappedLeads);
        }
        setLoading(false);
      });
  }, [supplierUser]);

  // Scroll to bottom when selecting a lead or when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedLeadId, leads]);

  const selectedLead = leads.find(l => l.id === selectedLeadId);

  const filteredLeads = leads.filter(lead => {
    if (activeTab === 'Unread') return lead.unreadCount > 0;
    // For Favourites, we could filter by a favourite flag if we had one
    return true; 
  });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedLeadId || sending) return;

    setSending(true);
    
    // Simulating sending since we don't have a messages table yet for replies
    setTimeout(() => {
      setLeads(prev => prev.map(lead => {
        if (lead.id === selectedLeadId) {
          return {
            ...lead,
            unreadCount: 0,
            messages: [...lead.messages, {
              id: Date.now(),
              type: 'text',
              sender: 'supplier',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              content: messageInput
            }]
          };
        }
        return lead;
      }));
      setMessageInput('');
      setSending(false);
    }, 500);
  };

  return (
    <div className="h-[calc(100vh-60px)] flex bg-white overflow-hidden">
      
      {/* Left Pane: Lead List */}
      <div className="w-full md:w-[380px] lg:w-[420px] flex-shrink-0 border-r border-gray-200 flex flex-col bg-white h-full relative z-10">
        
        {/* Header & Search */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold text-[#002d1b]">Messages</h1>
            <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
          
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search chats"
              className="block w-full pl-10 pr-3 py-2.5 border border-transparent bg-gray-100 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:bg-white focus:border-[#f36a1b] focus:ring-1 focus:ring-[#f36a1b] transition-colors"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            {['All', 'Unread', 'Favourites'].map((tab) => (
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
            <div className="p-8 text-center text-gray-400 text-sm">Loading chats...</div>
          ) : filteredLeads.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">No chats found.</div>
          ) : (
            filteredLeads.map((lead) => {
              const lastMessage = lead.messages && lead.messages.length > 0 
                ? lead.messages[lead.messages.length - 1] 
                : null;
                
              const snippet = lastMessage 
                ? (lastMessage.type === 'product_inquiry' ? `Inquiry: ${lastMessage.product?.title}` : lastMessage.content) 
                : lead.snippet;

              return (
                <div 
                  key={lead.id}
                  onClick={() => setSelectedLeadId(lead.id)}
                  className={`p-4 border-b border-gray-50 cursor-pointer transition-colors flex gap-3 hover:bg-gray-50 ${
                    selectedLeadId === lead.id ? 'bg-gray-50' : 'bg-white'
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${lead.avatarColor}`}>
                      {lead.initials}
                    </div>
                    {lead.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-0.5">
                      <h3 className="font-bold text-gray-900 truncate text-sm">{lead.name}</h3>
                      <span className={`text-xs font-semibold shrink-0 ml-2 ${lead.unreadCount > 0 ? 'text-emerald-600' : 'text-gray-500'}`}>
                        {lead.date}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-xs text-gray-500 mb-1">
                      <MapPin className="w-3 h-3 mr-1 shrink-0" />
                      <span className="truncate">{lead.location}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 truncate mr-2 flex items-center">
                        {lead.isCall && <PhoneMissed className="w-3.5 h-3.5 text-red-500 mr-1 shrink-0" />}
                        {snippet}
                      </p>
                      {lead.unreadCount > 0 && (
                        <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-sm">
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
          <div className="relative z-10 flex flex-col h-full w-full max-w-4xl mx-auto border-l border-r border-gray-100 bg-white/50 backdrop-blur-sm shadow-xl">
            
            {/* Chat Header & Buyer Details */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 shrink-0 flex items-center justify-between z-20 shadow-sm">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${selectedLead.avatarColor}`}>
                  {selectedLead.initials}
                </div>
                <div>
                  <h2 className="font-bold text-[#002d1b] text-lg leading-tight flex items-center gap-2">
                    {selectedLead.name}
                    {selectedLead.isOnline && <span className="w-2 h-2 rounded-full bg-green-500"></span>}
                  </h2>
                  <p className="text-sm text-gray-500 flex items-center mt-0.5">
                    <MapPin className="w-3 h-3 mr-1" /> {selectedLead.location}
                  </p>
                </div>
              </div>
              
              {/* Buyer Contact Info Panel */}
              <div className="hidden lg:flex items-center gap-4 border-l border-gray-200 pl-4 ml-4">
                <div className="flex flex-col gap-2 text-sm text-gray-600">
                  <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                    <Phone className="w-4 h-4 mr-2 text-[#f36a1b]" />
                    <span className="font-medium">{selectedLead.phone || '+91 98765 43210'}</span>
                  </div>
                  <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                    <Mail className="w-4 h-4 mr-2 text-[#f36a1b]" />
                    <span className="font-medium">{selectedLead.email || 'buyer@example.com'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Top info message about off-platform */}
              <div className="flex justify-center mb-6">
                <div className="bg-blue-50 text-blue-700 border border-blue-100 text-xs px-4 py-2 rounded-full flex items-center shadow-sm">
                  <Info className="w-4 h-4 mr-2" />
                  Buyer's contact details are available. You may reach out to them directly.
                </div>
              </div>

              {selectedLead.messages?.map((msg: any) => {
                const isBuyer = msg.sender === 'buyer';
                
                return (
                  <div key={msg.id} className={`flex flex-col ${isBuyer ? 'items-start' : 'items-end'}`}>
                    
                    {/* Timestamp */}
                    <span className="text-[10px] text-gray-400 font-medium mb-1 px-1">
                      {msg.timestamp}
                    </span>
                    
                    {/* Render Product Inquiry */}
                    {msg.type === 'product_inquiry' && msg.product && (
                      <div className="max-w-[85%] sm:max-w-md bg-white border border-[#f36a1b]/30 shadow-sm rounded-2xl rounded-tl-sm p-4 mb-2">
                        <div className="flex items-center gap-2 mb-3 border-b border-gray-100 pb-2">
                          <Package className="w-5 h-5 text-[#f36a1b]" />
                          <span className="text-xs font-bold text-[#f36a1b] uppercase tracking-wide">Product Inquiry</span>
                        </div>
                        <h4 className="font-bold text-[#002d1b] text-base leading-tight mb-2">
                          {msg.product.title}
                        </h4>
                        <div className="space-y-1 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                          <p><span className="font-semibold text-gray-800">Category:</span> {msg.product.category}</p>
                          <p><span className="font-semibold text-gray-800">Specs:</span> {msg.product.specs}</p>
                          <p><span className="font-semibold text-gray-800">Target Price:</span> {msg.product.targetPrice}</p>
                          <p><span className="font-semibold text-gray-800">Quantity:</span> {msg.product.qty}</p>
                        </div>
                      </div>
                    )}

                    {/* Render Text Message */}
                    {msg.type === 'text' && (
                      <div 
                        className={`max-w-[85%] sm:max-w-md px-5 py-3 shadow-sm ${
                          isBuyer 
                            ? 'bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-tl-sm' 
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
                  placeholder="Type a message or quote..."
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#f36a1b]/20 focus:border-[#f36a1b] transition-all shadow-inner"
                  disabled={sending}
                />
                <button 
                  type="submit" 
                  disabled={!messageInput.trim() || sending}
                  className="bg-[#f36a1b] text-white p-3 rounded-xl hover:bg-[#d95a12] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center shrink-0"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
              <div className="mt-2 text-center">
                <p className="text-[10px] text-gray-400">Press Enter to send. Messages are secure and monitored.</p>
              </div>
            </div>

          </div>
        ) : (
          // Empty Welcome State
          <div className="relative z-10 flex flex-col items-center justify-center text-center p-8 h-full max-w-lg mx-auto">
            
            <h2 className="text-3xl font-bold text-[#002d1b] mb-2">
              Welcome, <span className="text-[#f36a1b]">{supplierUser?.companyName || supplierUser?.name || 'Your Company'}</span>
            </h2>
            <p className="text-gray-600 font-medium mb-12">
              Connect With Buyers Seamlessly On Kifaru Trade
            </p>

            {/* Custom Illustration Composition */}
            <div className="relative w-64 h-64 flex items-center justify-center mb-8">
              {/* Central Circle */}
              <div className="absolute w-48 h-48 bg-gradient-to-br from-emerald-100 to-teal-50 rounded-full shadow-inner border border-white"></div>
              <div className="absolute w-56 h-56 rounded-full border border-emerald-100 animate-[spin_60s_linear_infinite]"></div>
              <div className="absolute w-64 h-64 rounded-full border border-gray-100 border-dashed animate-[spin_40s_linear_infinite_reverse]"></div>
              
              {/* Central Icon */}
              <div className="relative z-10 bg-white p-6 rounded-3xl shadow-xl border border-gray-50 transform hover:scale-105 transition-transform duration-300">
                <Users className="w-16 h-16 text-[#002d1b]" />
                <div className="absolute -bottom-3 -right-3 bg-[#f36a1b] p-2 rounded-xl shadow-lg">
                  <Globe2 className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* Floating avatar dots */}
              <div className="absolute top-4 right-10 w-8 h-8 bg-blue-100 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-blue-600 font-bold text-xs">V</div>
              <div className="absolute bottom-12 left-6 w-10 h-10 bg-purple-100 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-purple-600 font-bold text-sm">F</div>
              <div className="absolute top-20 left-4 w-6 h-6 bg-pink-100 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-pink-600 font-bold text-[10px]">S</div>
            </div>
            
          </div>
        )}

      </div>
    </div>
  );
}
