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

    const fetchProfile = async (userId: string, email: string, userMeta?: Record<string, unknown>) => {
      try {
        const cleanEmail = email.trim().toLowerCase();

        // 1. Check suppliers by UUID or email
        let { data, error } = await supabase
          .from('suppliers')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (!data) {
          const { data: byEmail } = await supabase
            .from('suppliers')
            .select('*')
            .ilike('email', cleanEmail)
            .maybeSingle();
          data = byEmail;
        }

        // If user is found in the suppliers table, load their profile.
        // Otherwise, they are NOT a supplier (e.g. they may be a buyer).
        // NEVER auto-create a supplier profile from an arbitrary user session!
        if (!mounted) return;

        if (data) {
          const loadedUser: SupplierUser = {
            id: data.id || userId,
            name: data.name || data.company_name || cleanEmail,
            email: data.email || cleanEmail,
            companyName: data.company_name || data.name,
            phone: data.phone || undefined,
            location: data.location || undefined,
            logoUrl: data.logo_url || undefined,
            role: "supplier",
          };
          setSupplierUser(loadedUser);
          if (typeof window !== 'undefined') {
            localStorage.setItem('kifaru_supplier_user', JSON.stringify(loadedUser));
          }
        } else {
          setSupplierUser(null);
          if (typeof window !== 'undefined') {
            localStorage.removeItem('kifaru_supplier_user');
          }
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
        fetchProfile(session.user.id, session.user.email || '', session.user.user_metadata);
      } else {
        // Fallback: Check localStorage if Supabase Auth session expired or loading
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('kifaru_supplier_user');
          if (stored) {
            try {
              setSupplierUser(JSON.parse(stored));
            } catch {
              setSupplierUser(null);
            }
          } else {
            setSupplierUser(null);
          }
        } else {
          setSupplierUser(null);
        }
        setIsSupplierLoading(false);
      }
    }).catch((err) => {
      console.error("Session get error:", err);
      if (mounted) {
        setIsSupplierLoading(false);
      }
    });

    // Listen for auth changes (login, logout, etc)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return;
        if (session?.user) {
          fetchProfile(session.user.id, session.user.email || '', session.user.user_metadata);
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
      const cleanEmail = email.trim().toLowerCase();

      // 1. Authenticate with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (authError || !authData.user) {
        if (authError?.message?.toLowerCase().includes("invalid login credentials")) {
          return { success: false, error: "Invalid email or password. Please verify your credentials." };
        }
        return { success: false, error: authError?.message || "Failed to log in." };
      }

      const user = authData.user;

      // 2. Fetch or auto-heal profile in suppliers table
      let { data: supplierProfile } = await supabase
        .from('suppliers')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (!supplierProfile) {
        const { data: byEmail } = await supabase
          .from('suppliers')
          .select('*')
          .ilike('email', cleanEmail)
          .maybeSingle();
        supplierProfile = byEmail;
      }

      if (!supplierProfile) {
        const companyName = user.user_metadata?.company_name || user.user_metadata?.name || cleanEmail.split('@')[0];
        const newRecord = {
          id: user.id,
          email: cleanEmail,
          name: companyName,
          company_name: companyName,
          phone: user.user_metadata?.phone || null,
          location: user.user_metadata?.country || null,
        };

        const { data: created } = await supabase
          .from('suppliers')
          .upsert([newRecord], { onConflict: 'id' })
          .select('*')
          .maybeSingle();

        supplierProfile = created || newRecord;
      }

      const loadedUser: SupplierUser = {
        id: supplierProfile.id || user.id,
        name: supplierProfile.name || supplierProfile.company_name || cleanEmail,
        email: supplierProfile.email || cleanEmail,
        companyName: supplierProfile.company_name || supplierProfile.name,
        phone: supplierProfile.phone || undefined,
        location: supplierProfile.location || undefined,
        logoUrl: supplierProfile.logo_url || undefined,
        role: "supplier",
      };

      setSupplierUser(loadedUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('kifaru_supplier_user', JSON.stringify(loadedUser));
      }

      return { success: true };
    },
    []
  );

  // ── Logout ──
  const supplierLogout = useCallback(async () => {
    await supabase.auth.signOut();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('kifaru_supplier_user');
    }
    setSupplierUser(null);
  }, []);

  const updateSupplierUser = useCallback((updates: Partial<SupplierUser>) => {
    setSupplierUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      if (typeof window !== 'undefined') {
        localStorage.setItem('kifaru_supplier_user', JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  const registerSupplier = useCallback(async (user: SupplierUser, password?: string) => {
    let finalUser = { ...user };
    const cleanEmail = (user.email || '').trim().toLowerCase();

    if (cleanEmail && password) {
      try {
        let targetId = '';

        const { data: authData } = await supabase.auth.signUp({
          email: cleanEmail,
          password: password,
          options: {
            data: {
              company_name: user.companyName,
              name: user.name,
              country: user.location,
              phone: user.phone,
              role: 'supplier',
            }
          }
        });

        if (authData?.user?.id) {
          targetId = authData.user.id;
        } else {
          // If already created, sign in to retrieve valid UUID
          const { data: signInData } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password: password,
          });
          if (signInData?.user?.id) {
            targetId = signInData.user.id;
          }
        }

        if (targetId) {
          finalUser = {
            ...user,
            id: targetId,
            email: cleanEmail,
          };

          await supabase
            .from('suppliers')
            .upsert([
              {
                id: targetId,
                email: cleanEmail,
                name: user.companyName || user.name || cleanEmail.split('@')[0],
                company_name: user.companyName || user.name || cleanEmail.split('@')[0],
                phone: user.phone || null,
                location: user.location || null,
              }
            ], { onConflict: 'id' });
        }
      } catch (err) {
        console.error("Failed to register supplier:", err);
      }
    }
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('kifaru_supplier_user', JSON.stringify(finalUser));
    }
    setSupplierUser(finalUser);
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
