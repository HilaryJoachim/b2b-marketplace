"use client";

import React, { useState } from 'react';
import { Check, Star, ShieldCheck, Rocket, Info, ChevronRight, Zap, X } from 'lucide-react';
import Link from 'next/link';

export default function SubscriptionsPage() {
  const [isYearly, setIsYearly] = useState(false);
  const [selectedPlanDetails, setSelectedPlanDetails] = useState<string | null>(null);

  return (
    <div className="p-4 sm:p-8 max-w-[1600px] mx-auto min-h-screen bg-gray-50/50">
      
      {/* Header Section */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-[#002d1b] mb-4">
          Grow Your B2B Sales Across Africa
        </h1>
        <p className="text-gray-600 text-sm md:text-base">
          Choose the plan that fits your business needs. Upgrade at any time to unlock more features, higher visibility, and direct buyer connections.
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <span className={`text-sm font-semibold ${!isYearly ? 'text-[#002d1b]' : 'text-gray-500'}`}>
            Monthly
          </span>
          <button 
            onClick={() => setIsYearly(!isYearly)}
            className="w-14 h-7 bg-[#002d1b] rounded-full relative transition-colors"
          >
            <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-transform ${isYearly ? 'translate-x-8' : 'translate-x-1'}`} />
          </button>
          <span className={`text-sm font-semibold flex items-center gap-2 ${isYearly ? 'text-[#002d1b]' : 'text-gray-500'}`}>
            Yearly
            <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
              2 Months Free
            </span>
          </span>
        </div>
      </div>

      {/* Current Plan Banner (Mocked) */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 flex flex-col sm:flex-row items-center justify-between">
        <div className="flex items-center gap-3 mb-4 sm:mb-0">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 shrink-0">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold text-[#002d1b]">You are currently on the Free Trial</p>
            <p className="text-sm text-gray-600">Your trial ends in 24 days. Upgrade now to keep receiving inquiries.</p>
          </div>
        </div>
      </div>

      {/* Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        
        {/* FREE TRIAL */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-500 mb-2">Starter Trial</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-[#002d1b]">$0</span>
              <span className="text-gray-500 font-medium">/ 31 days</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">Risk-free entry with all Starter features.</p>
          </div>
          
          <div className="flex-1 space-y-4 mb-8">
            <FeatureItem text="20 product listings" />
            <FeatureItem text="Company profile & catalogue" />
            <FeatureItem text="Buyer inquiries & WhatsApp" />
            <FeatureItem text="Basic analytics" />
            <FeatureItem text="Customer support" />
          </div>
          
          <button className="w-full py-3 rounded-lg border-2 border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-colors cursor-default">
            Current Plan
          </button>
        </div>

        {/* STARTER */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-[#002d1b] mb-2">Starter</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-[#002d1b]">${isYearly ? '200' : '20'}</span>
              <span className="text-gray-500 font-medium">/ {isYearly ? 'year' : 'month'}</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">For small businesses getting started.</p>
          </div>
          
          <div className="flex-1 space-y-4 mb-8">
            <FeatureItem text="20 product listings" />
            <FeatureItem text="Company profile & catalogue" />
            <FeatureItem text="Buyer inquiries & WhatsApp" />
            <FeatureItem text="Basic analytics" />
            <FeatureItem text="Customer support" />
          </div>
          
          <button className="w-full py-3 rounded-lg border-2 border-[#002d1b] text-[#002d1b] font-bold hover:bg-gray-50 transition-colors">
            Upgrade to Starter
          </button>
        </div>

        {/* BUSINESS (Most Popular) */}
        <div className="bg-white border-2 border-[#f36a1b] rounded-2xl p-6 shadow-md relative flex flex-col transform xl:-translate-y-4">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#f36a1b] text-white px-4 py-1 rounded-full text-xs font-bold tracking-wider uppercase flex items-center gap-1 shadow-sm whitespace-nowrap z-10">
            <Star className="w-3.5 h-3.5 fill-white" /> Most Popular
          </div>
          
          <div className="mb-6 mt-2">
            <h3 className="text-lg font-bold text-[#002d1b] mb-2 flex items-center gap-2">
              Business
              <ShieldCheck className="w-5 h-5 text-[#f36a1b]" />
            </h3>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-[#002d1b]">${isYearly ? '400' : '40'}</span>
              <span className="text-gray-500 font-medium">/ {isYearly ? 'year' : 'month'}</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">Build your presence and reach serious buyers across Africa and global markets.</p>
          </div>
          
          <div className="flex-1 space-y-4 mb-8">
            <FeatureItem text="50 product listings" bold />
            <FeatureItem text="Apply for Kifaru Verification" bold />
            <FeatureItem text="3 featured products" />
            <FeatureItem text="Buyer RFQ access" />
            <FeatureItem text="Lead notifications" />
            <FeatureItem text="Product performance reports" />
            
            <div className="pt-2">
              <span 
                onClick={() => setSelectedPlanDetails('business')}
                className="text-xs text-[#f36a1b] font-semibold hover:underline cursor-pointer"
              >
                + View all 9 features
              </span>
            </div>
          </div>
          
          <button className="w-full py-3 rounded-lg bg-[#f36a1b] text-white font-bold hover:bg-[#d95a12] transition-colors shadow-sm relative z-10">
            Upgrade to Business
          </button>
        </div>

        {/* PREMIUM */}
        <div className="bg-[#002d1b] text-white rounded-2xl p-6 shadow-md flex flex-col relative overflow-hidden">
          {/* Decorative element */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>

          <div className="mb-6 relative z-10">
            <h3 className="text-lg font-bold !text-white mb-2">Premium</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold !text-white">${isYearly ? '800' : '80'}</span>
              <span className="text-gray-200 font-medium">/ {isYearly ? 'year' : 'month'}</span>
            </div>
            <p className="text-sm text-gray-200 mt-2">For serious exporters, manufacturers & established suppliers</p>
          </div>
          
          <div className="flex-1 space-y-4 mb-8 relative z-10 text-sm">
            <FeatureItem text="100+ product listings" dark bold />
            <FeatureItem text="Highest search priority" dark />
            <FeatureItem text="10 featured products" dark />
            <FeatureItem text="Priority access to buyer RFQs" dark />
            <FeatureItem text="Dedicated account manager" dark />
            <FeatureItem text="Premium supplier profile" dark />

            <div className="pt-2">
              <span 
                onClick={() => setSelectedPlanDetails('premium')}
                className="text-xs text-emerald-400 font-semibold hover:underline cursor-pointer"
              >
                + View all 14 features
              </span>
            </div>
          </div>
          
          <button className="w-full py-3 rounded-lg bg-white text-[#002d1b] font-bold hover:bg-gray-100 transition-colors relative z-10">
            Go Premium
          </button>
        </div>

      </div>

      {/* Revenue Boosters (Add-ons) Section */}
      <div className="mt-12 max-w-4xl mx-auto pb-12">
        <div className="text-center mb-8">
          <span className="bg-orange-100 text-[#f36a1b] px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase mb-4 inline-block">
            Maximize Sales
          </span>
          <h2 className="text-2xl font-bold text-[#002d1b]">Boost Your Visibility</h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto text-sm md:text-base">Stand out from the competition with our powerful add-ons designed to drive targeted traffic directly to your profile and products.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Featured Product */}
          <div className="bg-white border-2 border-orange-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex flex-col h-full">
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mb-4">
                <Rocket className="w-6 h-6 text-[#f36a1b]" />
              </div>
              
              <h4 className="font-bold text-[#002d1b] text-xl mb-2">Feature a Product</h4>
              <p className="text-gray-600 text-xs leading-relaxed mb-8 flex-1">
                Pin your best-selling products to the top of search results in their specific category. Maximize eyes on your inventory and dramatically increase buyer inquiries.
              </p>
              
              <div className="flex items-center justify-between mt-auto">
                <div>
                  <span className="font-extrabold text-3xl text-[#002d1b]">$30</span>
                  <span className="text-gray-500 text-xs font-medium ml-1">/mo per product</span>
                </div>
                <button className="bg-[#f36a1b] text-white px-4 py-2.5 rounded-lg font-bold text-sm shadow-sm hover:bg-[#d95a12] transition-colors text-center">
                  Buy Boost
                </button>
              </div>
            </div>
          </div>

          {/* Featured Company */}
          <div className="bg-white border-2 border-emerald-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex flex-col h-full">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-emerald-600" />
              </div>
              
              <h4 className="font-bold text-[#002d1b] text-xl mb-2">Featured Company</h4>
              <p className="text-gray-600 text-xs leading-relaxed mb-8 flex-1">
                Dominate your niche. Your company profile will appear prominently across its main categories and on the homepage, establishing you as a top-tier supplier.
              </p>
              
              <div className="flex items-center justify-between mt-auto">
                <div>
                  <span className="font-extrabold text-3xl text-[#002d1b]">$50</span>
                  <span className="text-gray-500 text-xs font-medium ml-1">/mo</span>
                </div>
                <button className="bg-[#002d1b] text-white px-4 py-2.5 rounded-lg font-bold text-sm shadow-sm hover:bg-gray-800 transition-colors text-center">
                  Buy Boost
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Plan Details Modal */}
      {selectedPlanDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-[#002d1b]">
                {selectedPlanDetails === 'business' ? 'Business Plan Features' : 'Premium Plan Features'}
              </h3>
              <button 
                onClick={() => setSelectedPlanDetails(null)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {selectedPlanDetails === 'business' && (
                <div className="space-y-4">
                  <FeatureItem text="50 product listings" bold />
                  <FeatureItem text="Professional company profile" bold />
                  <FeatureItem text="Apply for Kifaru Verification" bold />
                  <FeatureItem text="Higher search ranking" />
                  <FeatureItem text="3 featured products" />
                  <FeatureItem text="Buyer RFQ access" />
                  <FeatureItem text="Lead notifications" />
                  <FeatureItem text="Product performance reports" />
                  <FeatureItem text="Standard customer support" />
                </div>
              )}
              
              {selectedPlanDetails === 'premium' && (
                <div className="space-y-4">
                  <FeatureItem text="100+ product listings" bold />
                  <FeatureItem text="Everything in Business" bold />
                  <FeatureItem text="Highest search priority" />
                  <FeatureItem text="10 featured products" />
                  <FeatureItem text="Priority access to buyer RFQs" />
                  <FeatureItem text="Advanced buyer/lead analytics" />
                  <FeatureItem text="Advanced product performance reports" />
                  <FeatureItem text="Homepage promotional opportunities" />
                  <FeatureItem text="Category promotional opportunities" />
                  <FeatureItem text="Listing assistance" />
                  <FeatureItem text="Priority customer support" />
                  <FeatureItem text="Dedicated account manager" />
                  <FeatureItem text="Monthly promotional credits" />
                  <FeatureItem text="Premium supplier profile" />
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-100">
              <button 
                onClick={() => setSelectedPlanDetails(null)}
                className="w-full py-3 rounded-lg bg-[#f36a1b] text-white font-bold hover:bg-[#d95a12] transition-colors shadow-sm"
              >
                {selectedPlanDetails === 'business' ? 'Upgrade to Business' : 'Go Premium'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Helper component for feature list items
function FeatureItem({ text, dark = false, bold = false }: { text: string, dark?: boolean, bold?: boolean }) {
  return (
    <div className={`flex items-start gap-3 ${dark ? 'text-white' : 'text-gray-600'} ${bold ? 'font-semibold' : ''}`}>
      <Check className={`w-5 h-5 shrink-0 ${dark ? 'text-[#f36a1b]' : 'text-[#f36a1b]'}`} />
      <span className="text-sm leading-tight pt-0.5">{text}</span>
    </div>
  );
}
