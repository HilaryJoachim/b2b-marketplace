"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { MessageSquareText, FileText, Search } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/utils/supabase/client";

export default function BuyerDashboardPage() {
  const router = useRouter();
  const { user, isLoading, openLoginModal } = useAuth();

  const [products, setProducts] = useState<any[]>([]);
  const [inquiryCount, setInquiryCount] = useState(0);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!isLoading && !user) {
      openLoginModal();
      router.push("/");
    }
  }, [isLoading, user, openLoginModal, router]);

  // Fetch real featured products and user inquiries
  useEffect(() => {
    const fetchProducts = async () => {
      // Fetch the latest 4 products, including the supplier's company name
      const { data, error } = await supabase
        .from('products')
        .select('*, suppliers(company_name)')
        .limit(4);

      if (data && !error) {
        setProducts(data);
      }
    };

    const fetchInquiries = async () => {
      const email = user?.email || (typeof window !== 'undefined' ? localStorage.getItem('kifaru_buyer_email') : null);
      if (!email) return;

      const { data } = await supabase
        .from('leads')
        .select('id')
        .eq('buyer_email', email);

      if (data) {
        setInquiryCount(data.length);
      }
    };

    fetchProducts();
    fetchInquiries();
  }, [user?.email]);

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-gray-200 rounded" />
          <div className="h-12 w-full bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* ─── Page Header ─── */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#002d1b]">
          Welcome back, {user.name || 'Buyer'}!
        </h1>
        <p className="text-gray-500 mt-2">
          Here is what's happening with your inquiries and quotes today.
        </p>
      </div>

      {/* ─── Quick Actions & Stats (Moved to Top) ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        
        <Link href="/buyer/dashboard/messages" className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group block cursor-pointer">
          {/* Watermark Icon */}
          <MessageSquareText className="absolute -right-4 top-1/2 -translate-y-1/2 w-32 h-32 text-gray-50 opacity-50 group-hover:scale-110 transition-transform duration-500" />
          
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <MessageSquareText className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Active Conversations</p>
                <p className="text-3xl font-bold text-gray-900">{inquiryCount}</p>
              </div>
            </div>
            <div className="text-sm font-medium text-blue-600 flex items-center gap-1 group-hover:gap-2 transition-all">
              View messages &rarr;
            </div>
          </div>
        </Link>

        <Link href="/buyer/dashboard/quotes" className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group block cursor-pointer">
          {/* Watermark Icon */}
          <FileText className="absolute -right-4 top-1/2 -translate-y-1/2 w-32 h-32 text-gray-50 opacity-50 group-hover:scale-110 transition-transform duration-500" />
          
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Active Inquiries & Quotes</p>
                <p className="text-3xl font-bold text-gray-900">{inquiryCount}</p>
              </div>
            </div>
            <div className="text-sm font-medium text-emerald-600 flex items-center gap-1 group-hover:gap-2 transition-all">
              View quotes &rarr;
            </div>
          </div>
        </Link>

      </div>

      {/* ─── Featured Products ─── */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Featured Products for You</h2>
          <Link href="/marketplace" className="text-sm font-semibold text-[#f36a1b] hover:underline">View all &rarr;</Link>
        </div>
        {products.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
            <p className="text-gray-500">No featured products available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((item) => (
              <Link 
                key={item.id} 
                href={`/product/${item.slug}`}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group cursor-pointer flex flex-col"
              >
                <div className="h-40 bg-gray-50 relative overflow-hidden flex items-center justify-center">
                  {/* Real Image */}
                  <img 
                    src={item.image_url || '/placeholder.png'} 
                    alt={item.title} 
                    className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-500" 
                  />
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    {item.suppliers?.company_name || 'Unknown Supplier'}
                  </p>
                  <h3 className="font-bold text-gray-900 text-sm mb-2 line-clamp-2 leading-tight group-hover:text-[#f36a1b] transition-colors">{item.title}</h3>
                  <div className="flex items-end justify-between mt-auto pt-4">
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Est. Price</p>
                      <p className="font-bold text-gray-900">${parseFloat(item.price).toLocaleString()}</p>
                    </div>
                    <button className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#f36a1b] group-hover:text-white transition-colors cursor-pointer">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
                      </svg>
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>



    </div>
  );
}
