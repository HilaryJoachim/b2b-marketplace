"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { supabase } from "@/utils/supabase/client";

// ── Types ───────────────────────────────────────────────────────────────────
export interface SupplierUser {
  id: string;
  name: string;
  email: string;
  companyName?: string;
  role: "supplier";
}

interface SupplierAuthContextType {
  supplierUser: SupplierUser | null;
  isSupplierLoading: boolean;
  supplierLogin: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  supplierLogout: () => void;
  // Login modal controls
  isSupplierLoginOpen: boolean;
  openSupplierLogin: () => void;
  closeSupplierLogin: () => void;
}

// ── Context ──────────────────────────────────────────────────────────────────
const SupplierAuthContext = createContext<SupplierAuthContextType | undefined>(
  undefined
);

export function SupplierAuthProvider({ children }: { children: ReactNode }) {
  const [supplierUser, setSupplierUser] = useState<SupplierUser | null>(null);
  const [isSupplierLoading, setIsSupplierLoading] = useState(true);
  const [isSupplierLoginOpen, setIsSupplierLoginOpen] = useState(false);

  // Listen to Supabase Auth State
  useEffect(() => {
    let mounted = true;

    const fetchProfile = async (userId: string, email: string) => {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (!mounted) return;

      if (data) {
        setSupplierUser({
          id: data.id,
          name: data.name || email,
          email: data.email,
          companyName: data.company_name,
          role: "supplier",
        });
      } else {
        // If they are not in the suppliers table, they are not a supplier.
        setSupplierUser(null);
      }
      setIsSupplierLoading(false);
    };

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email || '');
      } else {
        setSupplierUser(null);
        setIsSupplierLoading(false);
      }
    });

    // Listen for auth changes (login, logout, etc)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return;
        if (session?.user) {
          fetchProfile(session.user.id, session.user.email || '');
        } else {
          setSupplierUser(null);
          setIsSupplierLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const supplierLogin = useCallback(
    async (
      email: string,
      password: string
    ): Promise<{ success: boolean; error?: string }> => {
      // 1. Verify this email actually exists in the suppliers table
      const { data: supplierCheck, error: checkError } = await supabase
        .from('suppliers')
        .select('id')
        .eq('email', email)
        .single();
        
      if (checkError || !supplierCheck) {
         return { success: false, error: "This email is not registered as a seller account." };
      }

      // 2. Perform the actual login
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    },
    []
  );

  // ── Logout ──
  const supplierLogout = useCallback(async () => {
    await supabase.auth.signOut();
    setSupplierUser(null);
  }, []);

  // ── Modal Controls ──
  const openSupplierLogin = useCallback(() => {
    setIsSupplierLoginOpen(true);
  }, []);

  const closeSupplierLogin = useCallback(() => {
    setIsSupplierLoginOpen(false);
  }, []);

  return (
    <SupplierAuthContext.Provider
      value={{
        supplierUser,
        isSupplierLoading,
        supplierLogin,
        supplierLogout,
        isSupplierLoginOpen,
        openSupplierLogin,
        closeSupplierLogin,
      }}
    >
      {children}
    </SupplierAuthContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────────────────────
export function useSupplierAuth(): SupplierAuthContextType {
  const context = useContext(SupplierAuthContext);
  if (!context) {
    throw new Error(
      "useSupplierAuth must be used within a SupplierAuthProvider"
    );
  }
  return context;
}
