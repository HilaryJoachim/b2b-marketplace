"use client";

import { useEffect } from "react";
import { useSupplierAuth } from "@/context/SupplierAuthContext";
import { 
  Clock, 
  ExternalLink, 
  CheckCircle2, 
  Bell, 
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

  // Gate: redirect to login page if not authenticated
  useEffect(() => {
    if (!isSupplierLoading && !supplierUser) {
      router.push("/supplier/login");
    }
  }, [isSupplierLoading, supplierUser, router]);

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

  return (
    <div className="p-4 sm:p-8 max-w-[1600px] mx-auto space-y-8 bg-gray-50/50 min-h-screen">
      
      {/* ─── Header Section ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#002d1b]">
            Welcome back, {supplierUser.name}! 👋
          </h1>
          <p className="text-gray-500 mt-1">Here's what's happening with your business today.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Link 
            href="/supplier/dashboard/add-product" 
            className="bg-[#f36a1b] hover:bg-[#d95a12] text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm hover:shadow-md flex items-center gap-2"
          >
            <Package className="w-4 h-4" />
            Add New Product
          </Link>
        </div>
      </div>

      {/* ─── Top Metrics Row ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Metric 1 */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp className="w-16 h-16 text-[#f36a1b]" />
          </div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-[#f36a1b]">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Active Leads</p>
              <h3 className="text-2xl font-bold text-[#002d1b]">{isNewUser ? '0' : '24'}</h3>
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs font-medium text-emerald-600 relative z-10">
            <span className="bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> {isNewUser ? 'New Account' : '+3 this week'}
            </span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Eye className="w-16 h-16 text-[#002d1b]" />
          </div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-[#002d1b]">
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Profile Views</p>
              <h3 className="text-2xl font-bold text-[#002d1b]">{isNewUser ? '0' : '1,284'}</h3>
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs font-medium text-emerald-600 relative z-10">
            <span className="bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> {isNewUser ? 'New Account' : '+12% vs last month'}
            </span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Package className="w-16 h-16 text-[#002d1b]" />
          </div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-700">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Products</p>
              <h3 className="text-2xl font-bold text-[#002d1b]">{isNewUser ? '0' : '45'}</h3>
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs font-medium text-gray-500 relative z-10">
            <Link href="/supplier/dashboard/products" className="hover:text-[#f36a1b] hover:underline">
              Manage inventory &rarr;
            </Link>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <MessageSquare className="w-16 h-16 text-[#002d1b]" />
          </div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Unread Messages</p>
              <h3 className="text-2xl font-bold text-[#002d1b]">{isNewUser ? '0' : '2'}</h3>
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs font-medium text-gray-500 relative z-10">
             <Link href="/supplier/dashboard/all-leads" className="hover:text-[#f36a1b] hover:underline">
              View inbox &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* ─── Main Content Split (2/3 and 1/3) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* LEFT COLUMN: Recent Leads (Spans 2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="border-b border-gray-100 p-6 flex items-center justify-between bg-white">
              <div>
                <h2 className="text-lg font-bold text-[#002d1b]">Recent Opportunities</h2>
                <p className="text-sm text-gray-500 mt-1">Buyers actively looking for your products.</p>
              </div>
              <Link href="/supplier/dashboard/quotes" className="text-sm font-semibold text-[#f36a1b] hover:text-[#d95a12] flex items-center transition-colors">
                View All Quotes <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            
            <div className="flex-1 divide-y divide-gray-50">
              {isNewUser ? (
                <div className="p-16 text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="w-8 h-8 text-gray-300" />
                  </div>
                  <h3 className="text-lg font-bold text-[#002d1b] mb-1">No active leads yet</h3>
                  <p className="text-sm text-gray-500 max-w-sm mx-auto">Keep your profile updated and add more products to your catalog to attract buyers and receive quotes.</p>
                </div>
              ) : (
                <>
                  {/* Lead Item 1 */}
                  <div className="p-6 hover:bg-gray-50/50 transition-colors group">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="bg-orange-100 text-[#f36a1b] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Hot Lead
                          </span>
                          <span className="flex items-center text-xs text-gray-400 font-medium">
                            <Clock className="w-3.5 h-3.5 mr-1" /> Just now
                          </span>
                        </div>
                        <h3 className="font-bold text-[#002d1b] text-base group-hover:text-[#f36a1b] transition-colors cursor-pointer">
                          Automatic Thermoforming Machine
                        </h3>
                        <div className="flex items-center gap-4 mt-2">
                          <p className="text-sm text-gray-500 flex items-center">
                            <MapPin className="w-4 h-4 mr-1 text-gray-400" /> Greater Noida, India
                          </p>
                          <p className="text-sm text-gray-500 flex items-center">
                            <Package className="w-4 h-4 mr-1 text-gray-400" /> Qty: 2 Units
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0">
                        <Link href="/supplier/dashboard/quotes?action=respond&id=2" className="w-full sm:w-auto bg-white border border-[#002d1b] text-[#002d1b] hover:bg-[#002d1b] hover:text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-all block text-center">
                          Quote Now
                        </Link>
                      </div>
                    </div>
                  </div>
                  
                  {/* Lead Item 2 */}
                  <div className="p-6 hover:bg-gray-50/50 transition-colors group">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="flex items-center text-xs text-gray-400 font-medium">
                            <Clock className="w-3.5 h-3.5 mr-1" /> 2 hours ago
                          </span>
                        </div>
                        <h3 className="font-bold text-[#002d1b] text-base group-hover:text-[#f36a1b] transition-colors cursor-pointer">
                          Laundry Dry Cleaning Clothes Packing
                        </h3>
                        <div className="flex items-center gap-4 mt-2">
                          <p className="text-sm text-gray-500 flex items-center">
                            <MapPin className="w-4 h-4 mr-1 text-gray-400" /> Gurugram, India
                          </p>
                          <p className="text-sm text-gray-500 flex items-center">
                            <Package className="w-4 h-4 mr-1 text-gray-400" /> Qty: 500 Pieces
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0">
                        <Link href="/supplier/dashboard/quotes?action=respond&id=3" className="w-full sm:w-auto bg-white border border-[#002d1b] text-[#002d1b] hover:bg-[#002d1b] hover:text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-all block text-center">
                          Quote Now
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Lead Item 3 */}
                  <div className="p-6 hover:bg-gray-50/50 transition-colors group">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="flex items-center text-xs text-gray-400 font-medium">
                            <Clock className="w-3.5 h-3.5 mr-1" /> Yesterday
                          </span>
                        </div>
                        <h3 className="font-bold text-[#002d1b] text-base group-hover:text-[#f36a1b] transition-colors cursor-pointer">
                          Industrial Grade Stainless Steel Valves
                        </h3>
                        <div className="flex items-center gap-4 mt-2">
                          <p className="text-sm text-gray-500 flex items-center">
                            <MapPin className="w-4 h-4 mr-1 text-gray-400" /> Mumbai, India
                          </p>
                          <p className="text-sm text-gray-500 flex items-center">
                            <Package className="w-4 h-4 mr-1 text-gray-400" /> Qty: 150 Units
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0">
                        <Link href="/supplier/dashboard/quotes?action=respond&id=1" className="w-full sm:w-auto bg-white border border-[#002d1b] text-[#002d1b] hover:bg-[#002d1b] hover:text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-all block text-center">
                          Quote Now
                        </Link>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Widgets (Spans 1 column) */}
        <div className="space-y-6">
          
          {/* Profile Status Widget */}
          <div className="bg-[#002d1b] rounded-2xl shadow-sm p-6 text-white relative overflow-hidden">
             {/* Decorative circle */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            
            <div className="relative z-10">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                Premium Seller
              </h3>
              <p className="text-sm text-green-100 mt-1 mb-5">Your profile is highly visible.</p>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-semibold">
                  <span>Profile Completion</span>
                  <span>85%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div className="bg-[#f36a1b] h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              
              <Link href="/supplier/dashboard/profile" className="w-full mt-6 bg-white/10 hover:bg-white/20 border border-white/20 text-white py-2 rounded-lg text-sm font-semibold transition-colors block text-center">
                Complete Profile
              </Link>
            </div>
          </div>

          {/* Recent Messages Widget */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col">
            <div className="border-b border-gray-100 p-5 flex items-center justify-between">
              <h2 className="text-base font-bold text-[#002d1b] flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#f36a1b]" />
                Recent Messages
              </h2>
            </div>
            
            <div className="flex-1 divide-y divide-gray-50">
              {isNewUser ? (
                <div className="p-8 text-center">
                  <MessageSquare className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Your inbox is empty.</p>
                </div>
              ) : (
                <>
                  {/* Message 1 */}
                  <div className="p-5 hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="flex justify-between items-start mb-1.5">
                      <h3 className="font-bold text-[#002d1b] text-sm">Vishal</h3>
                      <span className="text-[10px] text-gray-400 font-medium">9th Aug</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">Chhindwara</p>
                    <p className="text-sm text-gray-700 line-clamp-2">
                      Additional details from Buyer Automation Grade Fully Automat...
                    </p>
                  </div>
                  
                  {/* Message 2 */}
                  <div className="p-5 hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="flex justify-between items-start mb-1.5">
                      <h3 className="font-bold text-[#002d1b] text-sm flex items-center gap-2">
                        Sushen Sharma
                        <span className="w-2 h-2 bg-[#f36a1b] rounded-full"></span>
                      </h3>
                      <span className="text-[10px] text-gray-400 font-medium">5th Aug</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">Jamshedpur</p>
                    <p className="text-sm text-gray-700 font-medium line-clamp-2">
                      I am interested in ECOSURE SEMI AUTOMATIC SAMPLING MACHINE...
                    </p>
                  </div>
                </>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-50 text-center">
              <Link href="/supplier/dashboard/all-leads" className="text-sm font-semibold text-gray-500 hover:text-[#002d1b] transition-colors">
                View Inbox
              </Link>
            </div>
          </div>

        </div>
      </div>
      
    </div>
  );
}
