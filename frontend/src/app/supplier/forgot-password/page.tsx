"use client";

import React, { useState } from 'react';
import { Mail, ArrowRight, Loader2, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/utils/supabase/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage('Please enter your email address');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    // First check if the email actually exists in our suppliers table
    const { data: supplier, error: queryError } = await supabase
      .from('suppliers')
      .select('email')
      .eq('email', email)
      .single();

    if (queryError || !supplier) {
      setStatus('idle');
      setErrorMessage('This email is not registered with us. Please check for typos or register a new account.');
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/supplier/set-password`,
    });

    if (error) {
      setStatus('error');
      setErrorMessage(error.message);
    } else {
      setStatus('success');
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
            We have sent a password reset link to <span className="font-semibold text-gray-900">{email}</span>.
          </p>
          <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 mb-8">
            <p className="text-sm text-orange-800 font-medium">
              Don't see it? Check your spam folder.
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
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#002d1b]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-[#002d1b]" />
          </div>
          <h2 className="text-2xl font-bold text-[#002d1b] mb-2">Reset Password</h2>
          <p className="text-gray-600 text-sm">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {errorMessage}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-semibold text-gray-700 block">Email Address</label>
            <div className="relative">
              <Mail className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#f36a1b]/20 focus:border-[#f36a1b] transition-all outline-none"
                placeholder="you@company.com"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full py-3.5 mt-2 bg-[#f36a1b] text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 hover:bg-[#d95a12] transition-all flex items-center justify-center gap-2 disabled:opacity-70 group"
          >
            {status === 'loading' ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                Send Reset Link
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
          
          <div className="text-center mt-6">
            <Link href="/" className="text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors">
              Back to Home
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
