"use client";

import React, { useState, useEffect } from "react";
import { useSupplierAuth } from "@/context/SupplierAuthContext";
import { Eye, EyeOff, LogIn, Building2, AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SupplierLoginPage() {
  const { supplierLogin, supplierUser, isSupplierLoading } = useSupplierAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // If they are already logged in, redirect them to dashboard
  useEffect(() => {
    if (!isSupplierLoading && supplierUser) {
      router.push("/supplier/dashboard");
    }
  }, [supplierUser, isSupplierLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setIsSubmitting(true);
    const result = await supplierLogin(email, password);
    setIsSubmitting(false);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        router.push("/supplier/dashboard");
      }, 1200);
    } else {
      setError(result.error || "Login failed. Please try again.");
    }
  };

  if (isSupplierLoading || supplierUser) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <Link href="/" className="mb-8 font-bold text-2xl text-[#002d1b] flex items-center gap-2">
        <div className="w-8 h-8 bg-white rounded flex items-center justify-center p-1 shadow-sm">
          <img src="/logo.png" alt="KifaruTrade" className="w-full h-full object-contain" />
        </div>
        KifaruTrade
      </Link>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* ── Branded Header ── */}
        <div className="relative bg-gradient-to-br from-[#002d1b] via-[#084C41] to-[#0a6b5a] px-8 py-10 text-center overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/5 rounded-full" />
          <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/5 rounded-full" />

          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/15 border border-white/25 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Supplier Portal
            </h2>
            <p className="text-sm text-white/60 mt-1.5">
              Sign in to manage your seller account
            </p>
          </div>
        </div>

        {/* ── Form Body ── */}
        <div className="px-8 py-8">
          {success ? (
            <div className="py-6 text-center">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-9 h-9 text-emerald-500" />
              </div>
              <p className="text-lg font-semibold text-gray-900">Welcome back!</p>
              <p className="text-sm text-gray-500 mt-1">Taking you to your dashboard...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Error Banner */}
              {error && (
                <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Email */}
              <div>
                <label
                  htmlFor="supplier-email"
                  className="block text-sm font-semibold text-gray-700 mb-1.5"
                >
                  Email Address
                </label>
                <input
                  id="supplier-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  placeholder="you@company.com"
                  autoComplete="email"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 bg-gray-50 transition-all focus:outline-none focus:ring-2 focus:ring-[#002d1b]/20 focus:border-[#002d1b] focus:bg-white"
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="supplier-password"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    Password
                  </label>
                  <Link
                    href="/supplier/forgot-password"
                    className="text-xs font-semibold text-[#f36a1b] hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="supplier-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 bg-gray-50 transition-all focus:outline-none focus:ring-2 focus:ring-[#002d1b]/20 focus:border-[#002d1b] focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4.5 h-4.5" />
                    ) : (
                      <Eye className="w-4.5 h-4.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3.5 px-6 rounded-xl bg-[#002d1b] text-white font-semibold text-sm hover:bg-[#084C41] active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 shadow-sm hover:shadow-md cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Signing In...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </>
                )}
              </button>
            </form>
          )}
        </div>
        
        <div className="px-8 py-5 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-600">
            Don't have a seller account?{" "}
            <Link href="/sell-with-us" className="font-semibold text-[#f36a1b] hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
