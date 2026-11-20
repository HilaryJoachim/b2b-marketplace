"use client";

import { AuthProvider } from "@/context/AuthContext";
import { SupplierAuthProvider } from "@/context/SupplierAuthContext";
import { InquiryProvider } from "@/context/InquiryContext";
import { CountryProvider } from "@/context/CountryContext";
import AuthModal from "@/components/auth/AuthModal";
import SupplierLoginModal from "@/components/supplier/auth/SupplierLoginModal";

/**
 * Client-side wrapper that provides the AuthContext, InquiryContext,
 * CountryContext, and renders auth modals globally so they can be triggered
 * from any component (navbar, product actions, etc).
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SupplierAuthProvider>
        <CountryProvider>
          <InquiryProvider>
            {children}
            {/* Global auth modals – rendered once at root level */}
            <AuthModal />
            <SupplierLoginModal />
          </InquiryProvider>
        </CountryProvider>
      </SupplierAuthProvider>
    </AuthProvider>
  );
}
