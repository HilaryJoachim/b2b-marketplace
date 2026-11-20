"use client";

import React, { useState } from 'react';
import { Bell, User, Phone, Briefcase, Mail, Smartphone, MessageCircle } from 'lucide-react';

export default function SupplierSettingsPage() {
  const [activeTab, setActiveTab] = useState('notifications');

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto min-h-screen">
      
      {/* 1. Header & Navigation Tabs */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#002d1b] mb-6">Settings</h1>
        
        <div className="flex overflow-x-auto hide-scrollbar border-b border-gray-200">
          <TabButton 
            id="notifications" 
            label="Notification Settings" 
            isActive={activeTab === 'notifications'} 
            onClick={() => setActiveTab('notifications')} 
          />
          <TabButton 
            id="account" 
            label="Account Settings" 
            isActive={activeTab === 'account'} 
            onClick={() => setActiveTab('account')} 
          />
          <TabButton 
            id="pns" 
            label="PNS Call Settings" 
            isActive={activeTab === 'pns'} 
            onClick={() => setActiveTab('pns')} 
          />
          <TabButton 
            id="buylead" 
            label="BuyLead Preferences" 
            isActive={activeTab === 'buylead'} 
            onClick={() => setActiveTab('buylead')} 
          />
        </div>
      </div>

      {/* 2. Notification Matrix Content */}
      {activeTab === 'notifications' && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden animate-in fade-in duration-300">
          
          {/* Matrix Header */}
          <div className="grid grid-cols-12 border-b border-gray-200 bg-gray-50/50">
            <div className="col-span-12 lg:col-span-4 p-5 flex items-center">
              <h2 className="text-sm font-bold text-gray-900">Manage Your Settings for Important Alerts</h2>
            </div>
            
            <div className="col-span-12 lg:col-span-8 grid grid-cols-4 divide-x divide-gray-200">
              {/* Email Column */}
              <div className="p-4 flex flex-col items-center justify-center text-center">
                <div className="flex items-center gap-1.5 mb-1 text-gray-900 font-bold text-sm">
                  <Mail className="w-4 h-4 text-gray-400" /> Email
                </div>
                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Primary</span>
                <span className="text-xs text-gray-600 font-medium">info@ecosurepulpmolding.com</span>
              </div>
              
              {/* SMS Column */}
              <div className="p-4 flex flex-col items-center justify-center text-center">
                <div className="flex items-center gap-1.5 mb-1 text-gray-900 font-bold text-sm">
                  <Smartphone className="w-4 h-4 text-gray-400" /> SMS
                </div>
                <div className="flex gap-4">
                  <div>
                    <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block">Primary</span>
                    <span className="text-xs text-gray-600 font-medium">9289377638</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block">Secondary</span>
                    <span className="text-xs text-gray-600 font-medium">9611339921</span>
                  </div>
                </div>
              </div>

              {/* App Column */}
              <div className="p-4 flex flex-col items-center justify-center text-center">
                <div className="flex items-center gap-1.5 mb-2 text-gray-900 font-bold text-sm">
                  <Bell className="w-4 h-4 text-gray-400" /> APP
                </div>
                <button className="text-[10px] bg-[#11b899] text-white font-bold px-3 py-1.5 rounded-full hover:bg-[#0da387] transition-colors shadow-sm">
                  Test Notification
                </button>
              </div>

              {/* WhatsApp Column */}
              <div className="p-4 flex flex-col items-center justify-center text-center">
                <div className="flex items-center gap-1.5 mb-1 text-gray-900 font-bold text-sm">
                  <MessageCircle className="w-4 h-4 text-[#25D366]" /> WhatsApp
                </div>
                <span className="text-[10px] font-semibold text-gray-400 italic">Not Connected</span>
              </div>
            </div>
          </div>

          {/* Section: Enquiries */}
          <SectionHeader title="Enquiries" />
          
          <SettingRow 
            title="Business Enquiries" 
            description="Sent to you by buyers."
            email={true} sms={null} app={true} whatsapp={null}
          />
          <SettingRow 
            title="Replies to your responses" 
            description="Receive notification of replies sent by the buyer to your responses."
            email={true} sms={null} app={true} whatsapp={null}
          />
          <SettingRow 
            title="Follow-up Reminders" 
            description="Get notified 10 min before the upcoming reminders."
            email={true} sms={null} app={true} whatsapp={null}
          />
          <SettingRow 
            title="Missed PNS* Calls" 
            description="Receive details of the buyer whose call was missed by you. *PNS - Preferred Number Service"
            email={false} sms={null} app={true} whatsapp={null}
          />
          <SettingRow 
            title="Answered PNS* Calls" 
            description="Receive details of the buyer whose call was answered by you."
            email={false} sms={null} app={true} whatsapp={null}
          />

          {/* Section: BuyLeads / Tenders */}
          <SectionHeader title="BuyLeads / Tenders" />
          
          <SettingRow 
            title="BuyLead Alerts" 
            description="Receive latest requirements posted by the buyers between 8 AM to 9 PM."
            email={true} sms={null} app={true} whatsapp={null}
          />

        </div>
      )}

      {/* Placeholders for other tabs */}
      {activeTab !== 'notifications' && (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
          <h3 className="text-xl font-bold text-gray-800 mb-2">Coming Soon</h3>
          <p className="text-gray-500">This settings panel is currently under development.</p>
        </div>
      )}

    </div>
  );
}

// Helper Components

function TabButton({ id, label, isActive, onClick }: { id: string, label: string, isActive: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-4 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${
        isActive 
          ? 'border-[#002d1b] text-[#002d1b]' 
          : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
      }`}
    >
      {label}
    </button>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="bg-gray-100 border-b border-gray-200 px-5 py-3">
      <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">{title}</h3>
    </div>
  );
}

function SettingRow({ 
  title, 
  description, 
  email, 
  sms, 
  app, 
  whatsapp 
}: { 
  title: string, 
  description: string, 
  email: boolean | null, 
  sms: boolean | null, 
  app: boolean | null, 
  whatsapp: boolean | null 
}) {
  return (
    <div className="grid grid-cols-12 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
      <div className="col-span-12 lg:col-span-4 p-5">
        <p className="text-sm font-bold text-gray-900 mb-1">{title}</p>
        <p className="text-xs text-gray-500 leading-relaxed pr-4">{description}</p>
      </div>
      
      <div className="col-span-12 lg:col-span-8 grid grid-cols-4 divide-x divide-gray-100">
        <div className="p-4 flex items-center justify-center">
          <ToggleSwitch initialState={email} />
        </div>
        <div className="p-4 flex items-center justify-center">
          <ToggleSwitch initialState={sms} />
        </div>
        <div className="p-4 flex items-center justify-center">
          <ToggleSwitch initialState={app} />
        </div>
        <div className="p-4 flex items-center justify-center">
          <ToggleSwitch initialState={whatsapp} />
        </div>
      </div>
    </div>
  );
}

// A modern toggle switch component. If initialState is null, it shows a disabled dash (-)
function ToggleSwitch({ initialState }: { initialState: boolean | null }) {
  const [isOn, setIsOn] = useState(initialState ?? false);

  if (initialState === null) {
    return <span className="text-gray-300 font-bold text-lg">-</span>;
  }

  return (
    <button 
      onClick={() => setIsOn(!isOn)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#f36a1b] focus:ring-offset-2 ${
        isOn ? 'bg-[#11b899]' : 'bg-gray-300'
      }`}
    >
      <span 
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          isOn ? 'translate-x-4' : 'translate-x-1'
        }`}
      />
    </button>
  );
}
