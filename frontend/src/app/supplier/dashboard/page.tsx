"use client";

import { useEffect, useState } from "react";
import { useSupplierAuth } from "@/context/SupplierAuthContext";
import { supabase } from "@/utils/supabase/client";
import { 
  Clock, 
  TrendingUp, 
  Eye, 
  Package, 
  MessageSquare, 
  ChevronRight, 
  MapPin, 
  Star 
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SupplierDashboardPage() {
  const router = useRouter();
  const { supplierUser, isSupplierLoading } = useSupplierAuth();
  const isNewUser = supplierUser?.id !== 'sup_demo_001';

  const [leads, setLeads] = useState<any[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(true);

  // Gate: redirect to login page if not authenticated
  useEffect(() => {
    if (!isSupplierLoading && !supplierUser) {
      router.push("/supplier/login");
    }
  }, [isSupplierLoading, supplierUser, router]);

  // Fetch real leads for this seller
  useEffect(() => {
    if (!supplierUser) return;

    const fetchDashboardLeads = async () => {
      try {
        let query = supabase
          .from('leads')
          .select('*, products(id, title, category, price, image_url)')
          .order('created_at', { ascending: false });

        if (supplierUser.id !== 'sup_demo_001') {
          query = query.or(`supplier_id.eq.${supplierUser.id},supplier_id.is.null`);
        }

        const { data, error } = await query;
        if (data && data.length > 0) {
          setLeads(data);
        } else if (supplierUser.id === 'sup_demo_001') {
          fetch('/api/messages')
            .then(res => res.json())
            .then(demoData => setLeads(demoData))
            .catch(() => {});
        } else {
          setLeads([]);
        }
      } catch (err) {
        console.error('Failed to load dashboard leads:', err);
      } finally {
        setLoadingLeads(false);
      }
    };

    fetchDashboardLeads();

    const channel = supabase
      .channel('supplier_dashboard_leads')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => {
        fetchDashboardLeads();
      })
      .subscribe();

    const interval = setInterval(fetchDashboardLeads, 4000);
    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [supplierUser?.id]);

  if (isSupplierLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-24 w-full bg-gray-200 rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-80 md:col-span-2 bg-gray-200 rounded-xl" />
            <div className="h-80 bg-gray-200 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!supplierUser) return null;

  const totalLeadsCount = leads.length;
  const unreadCount = leads.reduce((acc, l) => acc + (l.unread_count || 0), 0);

  // Helper to extract last message snippet
  const getLeadSnippet = (lead: any) => {
    if (lead.message) {
      try {
        const j = JSON.parse(lead.message);
        if (Array.isArray(j) && j.length > 0) {
          const last = j[j.length - 1];
          return last.content || (last.product ? `Inquiry for ${last.product.title}` : 'Inquiry received');
        }
      } catch (_) {}
      return lead.message;
    }
    return 'Inquiry received';
  };

  return (
    <div className="p-4 sm:p-8 max-w-[1600px] mx-auto space-y-8 bg-gray-50/60 min-h-screen">
      
      {/* ─── Header Section ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
            Welcome back, {supplierUser.name}! 👋
          </h1>
          <p className="text-gray-600 text-sm mt-1">Here is what is happening with your seller account today.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Link 
            href="/supplier/dashboard/add-product" 
            className="bg-[#f36a1b] hover:bg-[#d95a12] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Package className="w-4 h-4" />
            Add New Product
          </Link>
        </div>
      </div>

      {/* ─── Top Metrics Row ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-md hover:border-gray-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Active Leads</span>
            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-[#f36a1b] border border-orange-100">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">{totalLeadsCount}</h3>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100/60 px-2 py-0.5 rounded-full">
              <TrendingUp className="w-3 h-3" /> {totalLeadsCount > 0 ? `${totalLeadsCount} total` : 'New Account'}
            </span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-md hover:border-gray-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Profile Views</span>
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 border border-emerald-100">
              <Eye className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">{isNewUser ? '128' : '1,284'}</h3>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100/60 px-2 py-0.5 rounded-full">
              <TrendingUp className="w-3 h-3" /> +12% this month
            </span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-md hover:border-gray-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Total Products</span>
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-700 border border-slate-200">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">{isNewUser ? '1' : '45'}</h3>
            <Link href="/supplier/dashboard/products" className="text-xs font-semibold text-[#f36a1b] hover:text-[#d95a12] flex items-center gap-0.5">
              Manage inventory &rarr;
            </Link>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-md hover:border-gray-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Unread Messages</span>
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-100">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">{unreadCount}</h3>
            <Link href="/supplier/dashboard/all-leads" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5">
              View inbox &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* ─── Main Content Split (2/3 and 1/3) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* LEFT COLUMN: Recent Leads (Spans 2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white border border-gray-200/80 rounded-2xl shadow-xs overflow-hidden flex flex-col">
            <div className="border-b border-gray-100 p-6 flex items-center justify-between bg-white">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Recent Opportunities</h2>
                <p className="text-sm text-gray-500 mt-0.5">Buyers actively seeking quotes for products in your category.</p>
              </div>
              <Link href="/supplier/dashboard/all-leads" className="text-sm font-semibold text-[#f36a1b] hover:text-[#d95a12] flex items-center transition-colors">
                View All Leads <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            
            <div className="flex-1 divide-y divide-gray-100">
              {leads.length === 0 ? (
                <div className="py-16 px-6 text-center">
                  <div className="w-16 h-16 bg-gray-50 border border-gray-200/60 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Package className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-1">No active leads yet</h3>
                  <p className="text-sm text-gray-500 max-w-sm mx-auto mb-5 leading-relaxed">Keep your profile updated and add more products to your catalog to attract serious buyers and receive quotes.</p>
                  <Link 
                    href="/supplier/dashboard/add-product"
                    className="inline-flex items-center gap-2 bg-[#f36a1b] hover:bg-[#d95a12] text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-xs transition-colors"
                  >
                    <Package className="w-4 h-4" /> Add Products
                  </Link>
                </div>
              ) : (
                leads.slice(0, 4).map((lead) => {
                  const title = lead.products?.title || 'Product Inquiry';
                  const snippet = getLeadSnippet(lead);
                  const dateStr = new Date(lead.created_at).toLocaleDateString();

                  return (
                    <div key={lead.id} className="p-6 hover:bg-gray-50/70 transition-colors group">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="bg-orange-50 text-[#f36a1b] border border-orange-200/60 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                              {lead.unread_count > 0 ? 'New Inquiry' : 'Active Lead'}
                            </span>
                            <span className="flex items-center text-xs text-gray-400 font-medium">
                              <Clock className="w-3.5 h-3.5 mr-1" /> {dateStr}
                            </span>
                          </div>
                          <Link href={`/supplier/dashboard/all-leads?leadId=${lead.id}`}>
                            <h3 className="font-bold text-gray-900 text-base group-hover:text-[#f36a1b] transition-colors cursor-pointer">
                              {title}
                            </h3>
                          </Link>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-1 italic">
                            &ldquo;{snippet}&rdquo;
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <p className="text-sm text-gray-500 flex items-center">
                              <MapPin className="w-4 h-4 mr-1 text-gray-400" /> {lead.buyer_location || 'Online'}
                            </p>
                            <p className="text-sm text-gray-700 font-medium">
                              From: {lead.buyer_name}
                            </p>
                          </div>
                        </div>
                        <div className="shrink-0">
                          <Link 
                            href={`/supplier/dashboard/all-leads?leadId=${lead.id}`} 
                            className="w-full sm:w-auto bg-white border border-[#002d1b] text-[#002d1b] hover:bg-[#002d1b] hover:text-white px-5 py-2 rounded-xl text-sm font-semibold transition-all block text-center shadow-xs cursor-pointer"
                          >
                            Reply / Chat Now
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Widgets (Spans 1 column) */}
        <div className="space-y-6">
          
          {/* Profile Status Widget - Clean Executive High-Contrast Card */}
          <div className="bg-white border border-gray-200/90 rounded-2xl shadow-xs p-6 relative overflow-hidden">
            {/* Top decorative accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-600 via-emerald-500 to-[#f36a1b]"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200/70 text-xs font-bold">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  Premium Seller
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                  Active
                </span>
              </div>

              <h3 className="text-lg font-bold text-gray-900 tracking-tight">
                Profile Visibility
              </h3>
              <p className="text-xs text-gray-500 mt-1 mb-5 leading-relaxed">
                Your company profile is verified and prioritized in buyer search results across Africa.
              </p>
              
              <div className="space-y-2 bg-gray-50/80 border border-gray-100 p-3.5 rounded-xl">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-gray-700">Profile Completion</span>
                  <span className="text-emerald-700 font-bold">85%</span>
                </div>
                <div className="w-full bg-gray-200/80 rounded-full h-2 overflow-hidden">
                  <div className="bg-emerald-600 h-2 rounded-full transition-all duration-500" style={{ width: '85%' }}></div>
                </div>
              </div>
              
              <Link 
                href="/supplier/dashboard/profile" 
                className="w-full mt-5 bg-[#002d1b] hover:bg-[#084C41] text-white py-2.5 px-4 rounded-xl text-sm font-semibold transition-all shadow-xs hover:shadow flex items-center justify-center gap-2 text-center cursor-pointer"
              >
                Complete Profile &rarr;
              </Link>
            </div>
          </div>

          {/* Recent Messages Widget */}
          <div className="bg-white border border-gray-200/80 rounded-2xl shadow-xs flex flex-col overflow-hidden">
            <div className="border-b border-gray-100 p-5 flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#f36a1b]" />
                Recent Messages
              </h2>
              <Link href="/supplier/dashboard/all-leads" className="text-xs font-semibold text-[#f36a1b] hover:text-[#d95a12] transition-colors">
                View All &rarr;
              </Link>
            </div>
            
            <div className="flex-1 divide-y divide-gray-100">
              {leads.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-12 h-12 bg-gray-50 border border-gray-150 rounded-xl flex items-center justify-center mx-auto mb-2 text-gray-400">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-gray-900">Your inbox is empty</p>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">Direct messages and RFQ replies from buyers will appear here.</p>
                </div>
              ) : (
                leads.slice(0, 3).map((lead) => {
                  const snippet = getLeadSnippet(lead);
                  const dateStr = new Date(lead.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' });

                  return (
                    <Link 
                      key={lead.id}
                      href={`/supplier/dashboard/all-leads?leadId=${lead.id}`}
                      className="p-4 hover:bg-gray-50/70 transition-colors cursor-pointer block"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                          {lead.buyer_name}
                          {lead.unread_count > 0 && <span className="w-2 h-2 bg-[#f36a1b] rounded-full"></span>}
                        </h3>
                        <span className="text-[10px] text-gray-400 font-medium">{dateStr}</span>
                      </div>
                      <p className="text-xs text-gray-500 mb-1">{lead.buyer_location || 'Online'}</p>
                      <p className="text-xs text-gray-700 font-medium line-clamp-2">
                        {snippet}
                      </p>
                    </Link>
                  );
                })
              )}
            </div>
            
            <div className="p-3.5 border-t border-gray-100 bg-gray-50/50 text-center">
              <Link href="/supplier/dashboard/all-leads" className="text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors">
                Open Full Inbox &rarr;
              </Link>
            </div>
          </div>

        </div>
      </div>
      
    </div>
  );
}
