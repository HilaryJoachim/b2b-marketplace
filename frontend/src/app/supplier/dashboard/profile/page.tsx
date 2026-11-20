"use client";

import React, { useState, useEffect } from 'react';
import { 
  Building2, User, Mail, Phone, MapPin, CheckCircle, 
  ShieldCheck, Map, CreditCard, Landmark, Plus, Edit2, Info, Save, X, Loader2
} from 'lucide-react';
import { useSupplierAuth } from '@/context/SupplierAuthContext';
import { supabase } from '@/utils/supabase/client';

const COUNTRY_OPTIONS = [
  { value: 'india', label: 'India' },
  { value: 'kenya', label: 'Kenya' },
  { value: 'nigeria', label: 'Nigeria' },
  { value: 'south_africa', label: 'South Africa' },
  { value: 'ghana', label: 'Ghana' },
  { value: 'tanzania', label: 'Tanzania' },
  { value: 'uganda', label: 'Uganda' },
  { value: 'rwanda', label: 'Rwanda' },
  { value: 'us', label: 'United States' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'canada', label: 'Canada' },
  { value: 'australia', label: 'Australia' },
  { value: 'uae', label: 'United Arab Emirates' },
  { value: 'singapore', label: 'Singapore' },
  { value: 'china', label: 'China' },
  { value: 'germany', label: 'Germany' },
  { value: 'france', label: 'France' },
  { value: 'brazil', label: 'Brazil' },
  { value: 'mexico', label: 'Mexico' },
  { value: 'japan', label: 'Japan' },
  { value: 'south_korea', label: 'South Korea' },
  { value: 'other', label: 'Other/Global' },
];

export default function SupplierProfilePage() {
  const { supplierUser } = useSupplierAuth();
  const [selectedCountry, setSelectedCountry] = useState('india');

  // Edit modes
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingBusiness, setIsEditingBusiness] = useState(false);

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    companyName: 'Global Trade Solutions Ltd.',
    contactName: 'Export Sales Director',
    address: '92, Sector-Ecotech, Greater Noida, UP, India',
    phone: '+91 92893 77638',
    email: 'contact@globaltrade.com',
  });

  // Business Form State
  const [businessForm, setBusinessForm] = useState<Record<string, string>>({
    gstin: '09AAFC...',
    pan: 'AAFCE...',
    cin: 'U29305DL...',
    iec: 'AAFCE...',
  });

  useEffect(() => {
    if (supplierUser) {
      const isDemo = supplierUser.id === 'sup_demo_001';
      setProfileForm({
        companyName: supplierUser.companyName || supplierUser.name || '',
        contactName: isDemo ? 'Export Sales Director' : supplierUser.name || '',
        address: isDemo ? '92, Sector-Ecotech, Greater Noida, UP, India' : '',
        phone: isDemo ? '+91 92893 77638' : '',
        email: supplierUser.email || '',
      });
      if (!isDemo) {
        // Fetch full details if needed
        supabase.from('suppliers').select('name, company_name, phone, location').eq('id', supplierUser.id).single()
          .then(({ data }) => {
            if (data) {
              setProfileForm(prev => ({
                ...prev,
                contactName: data.name || prev.contactName,
                companyName: data.company_name || prev.companyName,
                phone: data.phone || prev.phone,
                address: data.location || prev.address,
              }));
            }
          });
        setBusinessForm({});
      }
    }
  }, [supplierUser]);

  const handleProfileChange = (key: string, value: string) => {
    setProfileForm(prev => ({ ...prev, [key]: value }));
  };

  const handleBusinessChange = (key: string, value: string) => {
    setBusinessForm(prev => ({ ...prev, [key]: value }));
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleProfileSave = async () => {
    if (!supplierUser || supplierUser.id === 'sup_demo_001') {
      setIsEditingProfile(false);
      return;
    }
    
    setIsSaving(true);
    await supabase.from('suppliers').update({
      name: profileForm.contactName,
      company_name: profileForm.companyName,
      phone: profileForm.phone,
      location: profileForm.address,
    }).eq('id', supplierUser.id);
    
    setIsSaving(false);
    setIsEditingProfile(false);
  };
  
  const handleBusinessSave = () => setIsEditingBusiness(false);

  const renderInput = (label: string, fieldKey: string, verified = false) => (
    <InputField
      label={label}
      value={businessForm[fieldKey] || ''}
      isEditing={isEditingBusiness}
      onChange={(val) => handleBusinessChange(fieldKey, val)}
      onEdit={() => setIsEditingBusiness(true)}
      verified={verified}
    />
  );

  // Dynamic fields logic
  const renderBusinessFields = () => {
    switch (selectedCountry) {
      case 'india':
        return (
          <>
            {renderInput("GSTIN", "gstin", true)}
            {renderInput("PAN", "pan", true)}
            {renderInput("Udyam Number", "udyam")}
            {renderInput("Aadhaar Number", "aadhaar")}
            {renderInput("CIN/LLPIN", "cin", true)}
            {renderInput("Import Export Code (IEC)", "iec", true)}
            {renderInput("TAN", "tan")}
          </>
        );
      case 'kenya':
        return (
          <>
            {renderInput("KRA PIN", "kra_pin")}
            {renderInput("Certificate of Incorporation", "cert_incorp")}
            {renderInput("VAT Registration Number", "vat")}
          </>
        );
      case 'nigeria':
        return (
          <>
            {renderInput("TIN (Tax Identification Number)", "tin")}
            {renderInput("CAC RC Number", "cac_rc")}
            {renderInput("VAT Number", "vat")}
          </>
        );
      case 'south_africa':
        return (
          <>
            {renderInput("CIPC Registration Number", "cipc")}
            {renderInput("SARS Tax Number", "sars")}
            {renderInput("VAT Registration Number", "vat")}
            {renderInput("B-BBEE Level", "bbbee")}
          </>
        );
      case 'ghana':
        return (
          <>
            {renderInput("TIN", "tin")}
            {renderInput("Certificate of Incorporation", "cert_incorp")}
          </>
        );
      case 'tanzania':
        return (
          <>
            {renderInput("TIN", "tin")}
            {renderInput("VRN (VAT Registration Number)", "vrn")}
            {renderInput("Certificate of Incorporation", "cert_incorp")}
          </>
        );
      case 'uganda':
      case 'rwanda':
        return (
          <>
            {renderInput("TIN", "tin")}
            {renderInput("Certificate of Incorporation", "cert_incorp")}
          </>
        );
      case 'us':
        return (
          <>
            {renderInput("EIN (Employer Identification Number)", "ein")}
            {renderInput("State Registration Number", "state_reg")}
          </>
        );
      case 'uk':
        return (
          <>
            {renderInput("Companies House Number", "companies_house")}
            {renderInput("VAT Number", "vat")}
            {renderInput("UTR (Unique Taxpayer Reference)", "utr")}
          </>
        );
      case 'canada':
        return (
          <>
            {renderInput("CRA Business Number", "cra")}
            {renderInput("GST/HST Number", "gst")}
          </>
        );
      case 'australia':
        return (
          <>
            {renderInput("ABN (Australian Business Number)", "abn")}
            {renderInput("ACN (Australian Company Number)", "acn")}
            {renderInput("TFN (Tax File Number)", "tfn")}
          </>
        );
      case 'uae':
        return (
          <>
            {renderInput("Trade License Number", "trade_license")}
            {renderInput("TRN (Tax Registration Number)", "trn")}
          </>
        );
      case 'singapore':
        return (
          <>
            {renderInput("UEN (Unique Entity Number)", "uen")}
            {renderInput("GST Registration Number", "gst")}
          </>
        );
      case 'china':
        return (
          <>
            {renderInput("Unified Social Credit Code", "uscc")}
          </>
        );
      case 'germany':
        return (
          <>
            {renderInput("Handelsregister Number", "handelsregister")}
            {renderInput("USt-IdNr (VAT ID)", "vat")}
            {renderInput("Steuernummer (Tax Number)", "tax_number")}
          </>
        );
      case 'france':
        return (
          <>
            {renderInput("SIRET / SIREN", "siret")}
            {renderInput("Numéro de TVA Intracommunautaire", "tva")}
          </>
        );
      case 'brazil':
        return (
          <>
            {renderInput("CNPJ", "cnpj")}
          </>
        );
      case 'mexico':
        return (
          <>
            {renderInput("RFC", "rfc")}
          </>
        );
      case 'japan':
        return (
          <>
            {renderInput("Corporate Number", "corp_number")}
          </>
        );
      case 'south_korea':
        return (
          <>
            {renderInput("Business Registration Number", "reg_number")}
          </>
        );
      default:
        return (
          <>
            {renderInput("Company Registration Number", "reg_number")}
            {renderInput("National Tax ID", "tax_id")}
            {renderInput("VAT/GST Number", "vat")}
          </>
        );
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto min-h-screen">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#002d1b]">Supplier Profile</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your business identity, contact details, and banking information.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Trust Profile Widget */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border-2 border-emerald-50 rounded-2xl p-6 shadow-sm relative overflow-hidden">
            {/* Decorative background shape */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-50 rounded-full blur-xl opacity-60 pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold text-[#002d1b] flex items-center gap-2">
                    {profileForm.companyName || 'Your Company'} <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  </h2>
                  <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider mt-1">Verified Supplier</p>
                </div>
                {isEditingProfile ? (
                  <button onClick={handleProfileSave} disabled={isSaving} className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg disabled:opacity-50">
                    {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save
                  </button>
                ) : (
                  <button onClick={() => setIsEditingProfile(true)} className="text-sm font-semibold text-[#f36a1b] hover:text-[#d95a12] flex items-center gap-1 bg-orange-50 px-3 py-1.5 rounded-lg transition-colors">
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                )}
              </div>

              <div className="flex gap-4 items-center mb-6">
                <div className="w-20 h-20 bg-gray-50 border-2 border-gray-100 rounded-2xl flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
                  <Building2 className="w-8 h-8 text-gray-300" />
                </div>
                <div className="flex-1">
                  {isEditingProfile ? (
                    <>
                      <input 
                        type="text" 
                        value={profileForm.companyName}
                        onChange={(e) => handleProfileChange('companyName', e.target.value)}
                        className="w-full font-bold text-lg text-gray-800 leading-tight border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-[#f36a1b] mb-1" 
                        placeholder="Company Name"
                      />
                      <input 
                        type="text" 
                        value={profileForm.contactName}
                        onChange={(e) => handleProfileChange('contactName', e.target.value)}
                        className="w-full text-sm text-gray-500 border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-[#f36a1b]" 
                        placeholder="Your Role/Name"
                      />
                    </>
                  ) : (
                    <>
                      <h3 className="font-bold text-lg text-gray-800 leading-tight">{profileForm.companyName || 'Your Company Name'}</h3>
                      <p className="text-sm text-gray-500 mt-1">{profileForm.contactName || 'Add Your Role'}</p>
                    </>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <ProfileItem 
                  icon={<MapPin className="w-4 h-4 text-gray-400" />} 
                  value={profileForm.address} 
                  fieldKey="address" 
                  isEditing={isEditingProfile} 
                  onChange={(val) => handleProfileChange('address', val)} 
                />
                <ProfileItem 
                  icon={<Phone className="w-4 h-4 text-gray-400" />} 
                  value={profileForm.phone} 
                  fieldKey="phone" 
                  isEditing={isEditingProfile} 
                  onChange={(val) => handleProfileChange('phone', val)} 
                  verified 
                />
                <ProfileItem 
                  icon={<Mail className="w-4 h-4 text-gray-400" />} 
                  value={profileForm.email} 
                  fieldKey="email" 
                  isEditing={isEditingProfile} 
                  onChange={(val) => handleProfileChange('email', val)} 
                  verified 
                />
              </div>
              
              <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                <span className="text-sm text-gray-600 font-medium">Profile Completion</span>
                <span className="text-sm font-bold text-emerald-600">85%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
              
              <button className="w-full mt-6 py-2.5 bg-[#f36a1b] text-white rounded-lg font-semibold text-sm hover:bg-[#d95a12] transition-colors shadow-sm">
                View Public Profile
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Settings Forms */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Business Details Section */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="border-b border-gray-100 p-6 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-[#002d1b] flex items-center gap-2">
                <Building2 className="w-5 h-5 text-gray-400" /> Business Details
              </h3>
              {isEditingBusiness ? (
                <button onClick={handleBusinessSave} className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg">
                  <Save className="w-3.5 h-3.5" /> Save
                </button>
              ) : (
                <button onClick={() => setIsEditingBusiness(true)} className="text-sm font-semibold text-[#f36a1b] hover:text-[#d95a12] flex items-center gap-1 bg-orange-50 px-3 py-1.5 rounded-lg transition-colors">
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
              )}
            </div>
            
            <div className="p-6">
              <div className="mb-8 p-4 bg-gray-50 border border-gray-200 rounded-xl flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-800 mb-1">Operating Country</label>
                  <p className="text-xs text-gray-500">Selecting a country updates the required registration fields below to match local laws.</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select 
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    disabled={!isEditingBusiness}
                    className="w-full sm:w-48 border border-gray-300 rounded-lg p-2 text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-[#f36a1b] focus:border-transparent outline-none bg-white shadow-sm disabled:opacity-70"
                  >
                    {COUNTRY_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {renderBusinessFields()}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

// Extracted helper components outside of the main component to prevent re-mounting
function InputField({ 
  label, 
  value, 
  isEditing, 
  onChange, 
  onEdit, 
  verified = false 
}: { 
  label: string; 
  value: string; 
  isEditing: boolean; 
  onChange: (val: string) => void; 
  onEdit: () => void; 
  verified?: boolean 
}) {
  const isFilled = value.length > 0;

  if (isEditing) {
    return (
      <div>
        <label className="flex justify-between text-xs font-bold text-gray-500 mb-1.5 tracking-wide">
          {label}
        </label>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Enter ${label}`}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#f36a1b]/20 focus:border-[#f36a1b]"
        />
      </div>
    );
  }

  return (
    <div>
      <label className="flex justify-between text-xs font-bold text-gray-500 mb-1.5 tracking-wide">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <span className={`text-sm flex-1 ${isFilled ? 'text-gray-900 font-semibold' : 'text-gray-400'}`}>
          {isFilled ? value : 'Not provided'}
        </span>
        {verified && isFilled ? (
           <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" title="Verified" />
        ) : !isFilled ? (
          <button 
            onClick={onEdit}
            className="text-xs font-bold text-[#f36a1b] hover:underline flex items-center gap-1 bg-orange-50 px-2 py-1 rounded"
          >
            <Plus className="w-3 h-3" /> Add
          </button>
        ) : null}
      </div>
      <div className="w-full h-px bg-gray-100 mt-2"></div>
    </div>
  );
}

function ProfileItem({ 
  icon, 
  value, 
  fieldKey, 
  isEditing, 
  onChange, 
  verified = false 
}: { 
  icon: React.ReactNode; 
  value: string; 
  fieldKey: string; 
  isEditing: boolean; 
  onChange: (val: string) => void; 
  verified?: boolean 
}) {
  if (isEditing) {
    return (
      <div className="flex items-center gap-2 mb-2">
        <div className="mt-0.5 shrink-0">{icon}</div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#f36a1b]/50 focus:border-[#f36a1b]"
          placeholder={`Enter ${fieldKey}`}
        />
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2 mb-3">
      <div className="mt-0.5">{icon}</div>
      <div className="flex items-center gap-1.5 flex-1">
        <span className="text-sm text-gray-700 leading-tight font-medium">{value || 'Not provided'}</span>
        {verified && value && <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" title="Verified" />}
      </div>
    </div>
  );
}
