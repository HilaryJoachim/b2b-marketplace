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
  phone?: string;
  location?: string;
  logoUrl?: string;
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
  updateSupplierUser: (updates: Partial<SupplierUser>) => void;
  registerSupplier: (user: SupplierUser, password?: string) => Promise<void> | void;
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
      try {
        const { data, error } = await supabase
          .from('suppliers')
          .select('*')
          .eq('id', userId)
          .single();
          
        if (!mounted) return;

        if (data && !error) {
          setSupplierUser({
            id: data.id,
            name: data.name || email,
            email: data.email,
            companyName: data.company_name,
            phone: data.phone || undefined,
            location: data.location || undefined,
            logoUrl: data.logo_url || undefined,
            role: "supplier",
          });
        } else {
          // If they are not in the suppliers table, they are not a supplier.
          setSupplierUser(null);
        }
      } catch (err) {
        console.error("Failed to fetch supplier profile:", err);
        if (mounted) setSupplierUser(null);
      } finally {
        if (mounted) setIsSupplierLoading(false);
      }
    };

    // Safety timeout: max 3.5s wait to avoid getting stuck on a loading spinner indefinitely
    const safetyTimer = setTimeout(() => {
      if (mounted) {
        setIsSupplierLoading(false);
      }
    }, 3500);

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email || '');
      } else {
        setSupplierUser(null);
        setIsSupplierLoading(false);
      }
    }).catch((err) => {
      console.error("Session get error:", err);
      if (mounted) {
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
      clearTimeout(safetyTimer);
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

  const updateSupplierUser = useCallback((updates: Partial<SupplierUser>) => {
    setSupplierUser(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  const registerSupplier = useCallback(async (user: SupplierUser, password?: string) => {
    if (user.email && password) {
      try {
        await supabase.auth.signUp({
          email: user.email,
          password: password,
          options: {
            data: {
              company_name: user.companyName,
              name: user.name,
              role: 'supplier',
            }
          }
        });
      } catch (err) {
        console.error("Failed to register supplier:", err);
      }
    }
    setSupplierUser(user);
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
        updateSupplierUser,
        registerSupplier,
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
