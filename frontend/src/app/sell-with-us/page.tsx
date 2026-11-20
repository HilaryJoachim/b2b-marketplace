"use client";

import React, { useState } from 'react';
import { Mail, Building2, Globe, Phone, ArrowRight, CheckCircle2, Loader2, ShieldCheck, TrendingUp, Users, Lock, LogIn } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/client';
import { useSupplierAuth } from '@/context/SupplierAuthContext';

export default function SellWithUsPage() {
  const router = useRouter();
  const { supplierLogin } = useSupplierAuth();
  const [isLogin, setIsLogin] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    companyName: '',
    country: '',
    phone: '',
  });

  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });
  
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (isLogin) {
      setLoginData(prev => ({ ...prev, [name]: value }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    if (isLogin) {
      const res = await supplierLogin(loginData.email, loginData.password);
      if (res.success) {
        router.push('/supplier/dashboard');
      } else {
        setStatus('error');
        setErrorMessage(res.error || 'Failed to login. Please check your credentials.');
      }
      return;
    }

    try {
      // Generate a temporary secure password for initial signup
      const tempPassword = Math.random().toString(36).slice(-10) + "Ab1!@";

      // 1. Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: tempPassword,
        options: {
          data: {
            company_name: formData.companyName,
          },
          emailRedirectTo: `${window.location.origin}/supplier/set-password`
        }
      });

      if (authError) throw new Error(authError.message);

      // If identities is empty, the user already existed before this signup attempt
      if (authData.user?.identities?.length === 0) {
        throw new Error("This email is already registered. Please log in instead.");
      }

      // 2. Insert profile into our custom 'suppliers' table
      // (Assuming the user ID matches the auth.users ID)
      if (authData.user) {
        const { error: dbError } = await supabase
          .from('suppliers')
          .upsert([
            {
              id: authData.user.id,
              email: formData.email,
              name: formData.companyName, // using company name as name for now
              company_name: formData.companyName,
              phone: formData.phone,
              location: formData.country,
            }
          ], { onConflict: 'id' });
          
        if (dbError) {
          console.warn('Profile creation note (likely already exists):', dbError.message);
          // We won't block the UI if profile creation fails slightly 
          // but in production we'd want a trigger or robust error handling
        }
      }

      setStatus('success');
    } catch (error: any) {
      console.error('Registration error:', error);
      setStatus('error');
      setErrorMessage(error.message || 'Failed to register. Please try again.');
    }
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-[#002d1b] mb-4">Check Your Email</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            We've sent a verification link to <span className="font-semibold text-gray-900">{formData.email}</span>. 
            Click the link in the email to activate your account and start your 31-day Starter Trial.
          </p>
          <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 mb-8">
            <p className="text-sm text-orange-800 font-medium">
              Don't see it? Check your spam folder or contact support.
            </p>
          </div>
          <Link href="/">
            <button className="w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">
              Return to Homepage
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      
      {/* Left side - Information & Benefits */}
      <div className="w-full md:w-5/12 bg-[#002d1b] text-white p-8 md:p-16 flex flex-col justify-between relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#f36a1b]/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-white rounded flex items-center justify-center p-1">
              <img src="/logo.png" alt="KifaruTrade" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-white text-xl tracking-wide">KifaruTrade</span>
          </Link>

          <h1 className="text-4xl md:text-5xl font-extrabold !text-white mb-6 leading-tight">
            Reach global buyers instantly.
          </h1>
          <p className="text-white/80 text-lg mb-12 max-w-md">
            Join thousands of successful suppliers. Start your 31-day trial with full access to Starter features.
          </p>

          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-[#f36a1b]/20 rounded-lg flex items-center justify-center shrink-0">
                <Globe className="w-5 h-5 text-[#f36a1b]" />
              </div>
              <div>
                <h3 className="font-bold !text-white text-lg mb-1">Global Reach</h3>
                <p className="text-white/70 text-sm">Access serious buyers from across Africa and the world.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-[#f36a1b]/20 rounded-lg flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5 text-[#f36a1b]" />
              </div>
              <div>
                <h3 className="font-bold !text-white text-lg mb-1">Grow Revenue</h3>
                <p className="text-white/70 text-sm">Respond directly to RFQs and receive direct inquiries.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-[#f36a1b]/20 rounded-lg flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-[#f36a1b]" />
              </div>
              <div>
                <h3 className="font-bold !text-white text-lg mb-1">Secure & Trusted</h3>
                <p className="text-white/70 text-sm">Verified buyer network with secure communication tools.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 text-sm text-gray-400 relative z-10">
          © 2026 KifaruTrade. All rights reserved.
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full md:w-7/12 p-8 md:p-16 lg:p-24 flex items-center justify-center bg-gray-50/30">
        <div className="max-w-md w-full">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              {isLogin ? 'Welcome Back, Seller' : 'Create your Seller Account'}
            </h2>
            <p className="text-gray-600">
              {isLogin ? 'Log in to manage your leads and products.' : 'Register today to start your free 31-day trial.'}
            </p>
          </div>

          {/* Toggle Button */}
          <div className="flex bg-gray-200/50 p-1 rounded-xl mb-8">
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${!isLogin ? 'bg-white shadow text-[#002d1b]' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Register
            </button>
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${isLogin ? 'bg-white shadow text-[#002d1b]' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Login
            </button>
          </div>

          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Email Field - Used for both Login & Register */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-semibold text-gray-700 block">Business Email *</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={isLogin ? loginData.email : formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#f36a1b]/20 focus:border-[#f36a1b] transition-all outline-none"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            {isLogin ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-semibold text-gray-700 block">Password *</label>
                  <Link href="/supplier/forgot-password" className="text-xs font-semibold text-[#f36a1b] hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={loginData.password}
                    onChange={handleInputChange}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#f36a1b]/20 focus:border-[#f36a1b] transition-all outline-none"
                    placeholder="Enter your password"
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <label htmlFor="companyName" className="text-sm font-semibold text-gray-700 block">Company Name *</label>
                  <div className="relative">
                    <Building2 className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      id="companyName"
                      name="companyName"
                      type="text"
                      required
                      value={formData.companyName}
                      onChange={handleInputChange}
                      className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#f36a1b]/20 focus:border-[#f36a1b] transition-all outline-none"
                      placeholder="e.g. Global Manufacturing Inc."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label htmlFor="country" className="text-sm font-semibold text-gray-700 block">Country *</label>
                    <div className="relative">
                      <Globe className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <select
                        id="country"
                        name="country"
                        required
                        value={formData.country}
                        onChange={handleInputChange}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#f36a1b]/20 focus:border-[#f36a1b] transition-all outline-none appearance-none"
                      >
                        <option value="" disabled>Select</option>
                        <option value="RW">Rwanda</option>
                        <option value="KE">Kenya</option>
                        <option value="UG">Uganda</option>
                        <option value="TZ">Tanzania</option>
                        <option value="ZA">South Africa</option>
                        <option value="NG">Nigeria</option>
                        <option value="GH">Ghana</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-semibold text-gray-700 block">Phone Number *</label>
                    <div className="relative">
                      <Phone className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#f36a1b]/20 focus:border-[#f36a1b] transition-all outline-none"
                        placeholder="+250 700 000 000"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
            
            <div className="pt-4">
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full py-3.5 bg-[#f36a1b] text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 hover:bg-[#d95a12] transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending Link...
                  </>
                ) : (
                  <>
                    {isLogin ? 'Login to Dashboard' : 'Create Account'}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
            
            {!isLogin && (
              <p className="text-xs text-gray-500 text-center mt-6">
                By registering, you agree to our <a href="#" className="text-[#f36a1b] hover:underline">Terms of Service</a> and <a href="#" className="text-[#f36a1b] hover:underline">Privacy Policy</a>.
              </p>
            )}
          </form>
        </div>
      </div>
      
    </div>
  );
}
