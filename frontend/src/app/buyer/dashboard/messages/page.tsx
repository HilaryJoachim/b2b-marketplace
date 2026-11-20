"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  MoreVertical, 
  MapPin, 
  MessageSquareText, 
  Store, 
  Globe2, 
  PhoneMissed,
  Phone,
  Mail,
  Send,
  Package,
  ShieldCheck
} from 'lucide-react';

export default function BuyerMessagesPage() {
  const [activeTab, setActiveTab] = useState('All');
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with empty chats instead of loading mock data
  useEffect(() => {
    setChats([]);
    setLoading(false);
  }, []);


  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedChatId, chats]);

  const selectedChat = chats.find(c => c.id === selectedChatId);

  const filteredChats = chats.filter(chat => {
    if (activeTab === 'Unread') return chat.unreadCount > 0;
    return true; 
  });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedChatId || sending) return;

    setSending(true);
    
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: selectedChatId,
          message: messageInput,
          senderType: 'buyer' // Identify as buyer
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        // Optimistically update UI
        setChats(prev => prev.map(chat => {
          if (chat.id === selectedChatId) {
            return {
              ...chat,
              messages: [...chat.messages, data.message]
            };
          }
          return chat;
        }));
        setMessageInput('');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="h-full flex bg-white overflow-hidden rounded-xl border border-gray-100 shadow-sm" style={{ height: 'calc(100vh - 105px)', margin: '16px' }}>
      
      {/* Left Pane: Chat List */}
      <div className="w-full md:w-[350px] lg:w-[380px] flex-shrink-0 border-r border-gray-200 flex flex-col bg-white h-full relative z-10">
        
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
              placeholder="Search suppliers..."
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
          ) : filteredChats.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">No chats found.</div>
          ) : (
            filteredChats.map((chat) => {
              const lastMessage = chat.messages && chat.messages.length > 0 
                ? chat.messages[chat.messages.length - 1] 
                : null;
                
              const snippet = lastMessage 
                ? (lastMessage.type === 'product_inquiry' ? `Inquiry: ${lastMessage.product?.title}` : lastMessage.content) 
                : chat.snippet;

              return (
                <div 
                  key={chat.id}
                  onClick={() => setSelectedChatId(chat.id)}
                  className={`p-4 border-b border-gray-50 cursor-pointer transition-colors flex gap-3 hover:bg-gray-50 ${
                    selectedChatId === chat.id ? 'bg-gray-50' : 'bg-white'
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg bg-orange-100 text-[#f36a1b]`}>
                      <Store className="w-5 h-5" />
                    </div>
                    {chat.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-0.5">
                      <h3 className="font-bold text-gray-900 truncate text-sm">Supplier {chat.name}</h3>
                      <span className={`text-xs font-semibold shrink-0 ml-2 ${chat.unreadCount > 0 ? 'text-emerald-600' : 'text-gray-500'}`}>
                        {chat.date}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-xs text-gray-500 mb-1">
                      <ShieldCheck className="w-3 h-3 mr-1 shrink-0 text-emerald-500" />
                      <span className="truncate">Verified Supplier</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 truncate mr-2 flex items-center">
                        {snippet}
                      </p>
                      {chat.unreadCount > 0 && (
                        <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-sm">
                          {chat.unreadCount}
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

        {selectedChat ? (
          // Active Chat View
          <div className="relative z-10 flex flex-col h-full w-full max-w-4xl mx-auto border-l border-r border-gray-100 bg-white/50 backdrop-blur-sm shadow-xl">
            
            {/* Chat Header & Supplier Details */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 shrink-0 flex items-center justify-between z-20 shadow-sm">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg bg-orange-100 text-[#f36a1b]`}>
                  <Store className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-bold text-[#002d1b] text-lg leading-tight flex items-center gap-2">
                    Supplier {selectedChat.name}
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  </h2>
                  <p className="text-sm text-gray-500 flex items-center mt-0.5">
                    <MapPin className="w-3 h-3 mr-1" /> {selectedChat.location}
                  </p>
                </div>
              </div>
              
              {/* Supplier Contact Info Panel */}
              <div className="hidden lg:flex items-center gap-4 border-l border-gray-200 pl-4 ml-4">
                <div className="flex flex-col gap-2 text-sm text-gray-600">
                  <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                    <Phone className="w-4 h-4 mr-2 text-emerald-600" />
                    <span className="font-medium">+91 99887 77665</span>
                  </div>
                  <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                    <Mail className="w-4 h-4 mr-2 text-emerald-600" />
                    <span className="font-medium">contact@supplier.com</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {selectedChat.messages?.map((msg: any) => {
                // In buyer view, "buyer" is "Me" (right side), "seller" is "Them" (left side)
                const isMe = msg.sender === 'buyer';
                
                return (
                  <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    
                    {/* Timestamp */}
                    <span className="text-[10px] text-gray-400 font-medium mb-1 px-1">
                      {msg.timestamp}
                    </span>
                    
                    {/* Render Product Inquiry */}
                    {msg.type === 'product_inquiry' && msg.product && (
                      <div className="max-w-[85%] sm:max-w-md bg-white border border-[#f36a1b]/30 shadow-sm rounded-2xl rounded-tr-sm p-4 mb-2">
                        <div className="flex items-center gap-2 mb-3 border-b border-gray-100 pb-2">
                          <Package className="w-5 h-5 text-[#f36a1b]" />
                          <span className="text-xs font-bold text-[#f36a1b] uppercase tracking-wide">My Product Inquiry</span>
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
                          isMe 
                            ? 'bg-[#f36a1b] text-white rounded-2xl rounded-tr-sm' 
                            : 'bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-tl-sm'
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
                  placeholder="Type your message to the supplier..."
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#f36a1b]/20 focus:border-[#f36a1b] transition-all shadow-inner"
                  disabled={sending}
                />
                <button 
                  type="submit" 
                  disabled={!messageInput.trim() || sending}
                  className="bg-[#002d1b] text-white p-3 rounded-xl hover:bg-[#001f12] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center shrink-0"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>

          </div>
        ) : (
          // Empty Welcome State
          <div className="relative z-10 flex flex-col items-center justify-center text-center p-8 h-full max-w-lg mx-auto">
            <h2 className="text-3xl font-bold text-[#002d1b] mb-2">
              Your Messages
            </h2>
            <p className="text-gray-600 font-medium mb-12">
              Select a supplier from the left to continue your conversation.
            </p>
            <div className="w-32 h-32 bg-orange-50 rounded-full flex items-center justify-center">
              <MessageSquareText className="w-16 h-16 text-[#f36a1b]" />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
