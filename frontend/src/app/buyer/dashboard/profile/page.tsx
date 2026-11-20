"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { User, Mail, Phone, MapPin, Building2, Save } from "lucide-react";
import { supabase } from "@/utils/supabase/client";

export default function BuyerProfilePage() {
  const { user, refreshProfile } = useAuth();
  
  // Local state for profile fields
  const [formData, setFormData] = useState({
    name: "",
    companyName: "",
    email: "",
    phone: "",
    address: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");

  // Populate from auth user when available
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        companyName: user.companyName || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSaving(true);
    setSaveMessage("");
    setSaveError("");
    
    const { error } = await supabase
      .from('buyers')
      .update({
        phone: formData.phone,
        company_name: formData.companyName,
        address: formData.address,
      })
      .eq('id', user.id);

    setIsSaving(false);

    if (error) {
      setSaveError("Failed to update profile. " + error.message);
    } else {
      setSaveMessage("Profile updated successfully!");
      refreshProfile(); // Refresh context to show new data everywhere
      setTimeout(() => setSaveMessage(""), 3000);
    }
  };

  if (!user) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-[#002d1b] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
        <p className="text-gray-500">Manage your personal and company contact details.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

        {/* Profile Form */}
        <form onSubmit={handleSave} className="p-6 md:p-8 space-y-8 bg-gray-50/50">
          
          {/* Account Information Card */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
              <User className="w-5 h-5 text-[#f36a1b]" /> Account Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Name (Disabled) */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="text-gray-900 font-medium text-lg">{formData.name}</div>
                <p className="text-xs text-gray-400 mt-2">To change your name, please contact support.</p>
              </div>

              {/* Company (Editable) */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="Enter your company name"
                  className="block w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-gray-900 focus:ring-2 focus:ring-[#f36a1b] focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Contact Details Card */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
              <Phone className="w-5 h-5 text-[#f36a1b]" /> Contact Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed shadow-sm"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#f36a1b] focus:border-transparent outline-none transition-all hover:border-gray-300 shadow-sm"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Physical Address
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={3}
                    className="block w-full pl-10 pr-3 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#f36a1b] focus:border-transparent outline-none transition-all hover:border-gray-300 shadow-sm resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex items-center justify-between">
            <div>
              {saveMessage && (
                <span className="text-emerald-600 font-bold text-sm flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {saveMessage}
                </span>
              )}
              {saveError && (
                <span className="text-red-600 font-bold text-sm flex items-center gap-2 bg-red-50 px-3 py-1.5 rounded-full border border-red-100">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  {saveError}
                </span>
              )}
            </div>
            
            <button
              type="submit"
              disabled={isSaving}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white transition-all shadow-md ${
                isSaving 
                  ? "bg-gray-400 cursor-not-allowed" 
                  : "bg-[#002d1b] hover:bg-[#001f12] shadow-[#002d1b]/20"
              }`}
            >
              {isSaving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
