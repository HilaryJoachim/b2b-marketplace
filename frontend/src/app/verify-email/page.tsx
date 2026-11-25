"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, CheckCircle2, XCircle, ShieldCheck, Eye, EyeOff, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useSupplierAuth, SupplierUser } from '@/context/SupplierAuthContext';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const { registerSupplier } = useSupplierAuth();
  
  const [status, setStatus] = useState<'verifying' | 'create-password' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');
  const [verifiedUser, setVerifiedUser] = useState<SupplierUser | null>(null);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token found in the URL.');
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (res.ok) {
          const supplierData: SupplierUser = {
            id: "sup_" + Math.random().toString(36).substr(2, 9),
            name: data.user.companyName,
            email: data.user.email,
            companyName: data.user.companyName,
            role: "supplier"
          };
          setVerifiedUser(supplierData);
          setStatus('create-password');
        } else {
          setStatus('error');
          setMessage(data.error || 'Verification failed. The link may be expired.');
        }
      } catch (err) {
        setStatus('error');
        setMessage('A network error occurred. Please try again.');
      }
    };

    verifyToken();
  }, [token]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!strongRegex.test(password)) {
      setPasswordError('Password must be at least 8 characters, include an uppercase letter, a number, and a special character.');
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    if (verifiedUser) {
      if (registerSupplier) {
        await registerSupplier(verifiedUser, password);
      }
      setStatus('success');
      setTimeout(() => {
         router.push('/supplier/dashboard');
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        
        {status === 'verifying' && (
          <>
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Email...</h2>
            <p className="text-gray-500">Please wait while we verify your account securely.</p>
          </>
        )}

        {status === 'create-password' && (
          <div className="animate-in fade-in zoom-in duration-300 text-left">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-emerald-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-[#002d1b] mb-2 text-center">Secure Your Account</h2>
            <p className="text-gray-600 mb-6 text-center text-sm">
              Your email <span className="font-semibold text-gray-900">{verifiedUser?.email}</span> is verified. Now, create a strong password for your seller dashboard.
            </p>

            {passwordError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-100">
                {passwordError}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#f36a1b]/20 focus:border-[#f36a1b] transition-all"
                    placeholder="Create a strong password"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Confirm Password *</label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#f36a1b]/20 focus:border-[#f36a1b] transition-all"
                  placeholder="Repeat password"
                />
              </div>

              <div className="pt-2">
                <button type="submit" className="w-full py-3 bg-[#f36a1b] text-white font-bold rounded-xl shadow-md hover:bg-[#d95a12] transition-colors flex items-center justify-center gap-2 group">
                  Complete Setup <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </form>
          </div>
        )}

        {status === 'success' && (
          <div className="animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-[#002d1b] mb-2">Setup Complete!</h2>
            <p className="text-gray-600 mb-6">
              Your account is secure. Redirecting you to your brand new dashboard...
            </p>
            <Loader2 className="w-6 h-6 text-[#f36a1b] animate-spin mx-auto" />
          </div>
        )}

        {status === 'error' && (
          <div className="animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <Link href="/sell-with-us">
              <button className="w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">
                Try Registering Again
              </button>
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#f36a1b]" /></div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
