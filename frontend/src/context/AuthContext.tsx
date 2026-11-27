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

// ── Types ──────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  companyName?: string | null;
  country?: string | null;
  address?: string | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  logout: () => void;
  // Modal controls
  openAuthModal: (redirectUrl?: string) => void;
  openLoginModal: (redirectUrl?: string) => void;
  closeAuthModal: () => void;
  isAuthModalOpen: boolean;
  authRedirectUrl: string | null;
  // Legacy modal aliases
  isLoginModalOpen: boolean;
  isSignupModalOpen: boolean;
  closeAuthModals: () => void;
  openSignupModal: () => void;
  login: (email: string, password?: string) => Promise<any>;
  signup: (data: any) => Promise<any>;
  // OTP Flow
  checkUserExists: (email: string) => Promise<boolean>;
  requestOTP: (email: string, userData?: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  verifyOTP: (email: string, code: string) => Promise<{ success: boolean; error?: string }>;
  refreshProfile: () => Promise<void>;
}

// ── Context ────────────────────────────────────────
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authRedirectUrl, setAuthRedirectUrl] = useState<string | null>(null);
  
  // Store temporary user data during registration flow
  const [tempUserData, setTempUserData] = useState<Record<string, Partial<User>>>({});

  // Hydrate session from Supabase
  useEffect(() => {
    let mounted = true;

    const fetchProfile = async (userId: string, email: string, userMeta?: any, existingBuyerData?: any) => {
      const metaName = userMeta?.full_name || userMeta?.name || userMeta?.user_name;
      
      let buyerRecord = existingBuyerData;
      if (!buyerRecord) {
        const { data } = await supabase
          .from('buyers')
          .select('*')
          .eq('id', userId)
          .maybeSingle();
        buyerRecord = data;
      }
        
      if (!mounted) return;

      const resolvedName = buyerRecord?.name || metaName || (email ? email.split("@")[0] : "Kim Sako");

      if (buyerRecord) {
        setUser({
          id: buyerRecord.id,
          name: resolvedName,
          email: buyerRecord.email || email,
          phone: buyerRecord.phone || userMeta?.phone,
          country: buyerRecord.country || userMeta?.country,
          companyName: buyerRecord.company_name,
          address: buyerRecord.address,
        });
      } else {
        setUser({
          id: userId,
          name: resolvedName,
          email: email,
          phone: userMeta?.phone,
        });
      }

      if (typeof window !== "undefined") {
        if (email) localStorage.setItem("kifaru_buyer_email", email.toLowerCase());
        if (resolvedName) localStorage.setItem("kifaru_buyer_name", resolvedName);
      }

      setIsLoading(false);
    };

    const handleSession = async (session: any) => {
      if (!mounted) return;
      if (!session?.user) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      const userId = session.user.id;
      const email = session.user.email || '';
      const userMeta = session.user.user_metadata;

      // 1. Check if user is registered in buyers table
      const { data: buyerData } = await supabase
        .from('buyers')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (buyerData) {
        // Confirmed buyer profile exists!
        fetchProfile(userId, email, userMeta, buyerData);
        return;
      }

      // 2. If not in buyers table, check if this is an explicit supplier role
      if (userMeta?.role === 'supplier') {
        setUser(null);
        setIsLoading(false);
        return;
      }

      // 3. Double check suppliers table
      const { data: supplierData } = await supabase
        .from('suppliers')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (supplierData) {
        // Pure supplier session without a buyer profile
        setUser(null);
        setIsLoading(false);
        return;
      }

      // 4. Default: User logged in via buyer flow (e.g. OTP)
      fetchProfile(userId, email, userMeta);
    };

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session);
    });

    // Listen for auth changes (login, logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        handleSession(session);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // ── OTP Logic ──
  const checkUserExists = useCallback(async (email: string): Promise<boolean> => {
    const cleanEmail = email.trim().toLowerCase();

    // Check if email exists in either buyers or suppliers using a secure RPC function
    const { data, error } = await supabase.rpc('check_email_exists', { p_email: cleanEmail });
    
    if (error) {
      console.error("Error checking email:", error);
      // Fallback: check buyers table directly
      const { data: buyerRow } = await supabase
        .from('buyers')
        .select('id')
        .ilike('email', cleanEmail)
        .maybeSingle();
      return !!buyerRow;
    }
    
    // If the email is registered as a buyer (in auth.users or buyers table),
    // they are an existing buyer! Proceed with OTP login.
    if (data?.is_buyer) {
      return true;
    }

    // Only throw if they are strictly registered as a supplier and NOT as a buyer
    if (data?.is_supplier && !data?.is_buyer) {
      throw new Error("This email is registered as a seller account. Please use the Supplier Login.");
    }

    // New user
    return false;
  }, []);

  const requestOTP = useCallback(
    async (email: string, userData?: Partial<User>): Promise<{ success: boolean; error?: string }> => {
      try {
        if (userData) {
          // Store new user data temporarily to insert after verification
          setTempUserData(prev => ({ ...prev, [email.toLowerCase()]: userData }));
        }

        const { error } = await supabase.auth.signInWithOtp({
          email: email,
        });

        if (error) {
          return { success: false, error: error.message };
        }

        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || "An unexpected error occurred." };
      }
    },
    []
  );

  const verifyOTP = useCallback(
    async (email: string, code: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const normalizedEmail = email.toLowerCase();
        
        const { data: authData, error: authError } = await supabase.auth.verifyOtp({
          email: normalizedEmail,
          token: code,
          type: 'email',
        });

        if (authError || !authData.user) {
          return { success: false, error: authError?.message || "Invalid or expired verification code." };
        }

        // Successfully verified. Let's ensure they are in the `buyers` table.
        const userId = authData.user.id;
        
        const { data: existingBuyer } = await supabase
          .from('buyers')
          .select('*')
          .eq('id', userId)
          .single();

        let finalUser: User;

        if (!existingBuyer) {
          // It's a new user! Insert their temporarily stored data into the buyers table
          const newUserData = tempUserData[normalizedEmail] || {};
          
          const newBuyerProfile = {
            id: userId,
            email: normalizedEmail,
            name: newUserData.name || normalizedEmail.split("@")[0],
            phone: newUserData.phone || null,
            country: newUserData.country || null,
          };

          const { error: insertError } = await supabase
            .from('buyers')
            .upsert([newBuyerProfile], { onConflict: 'id' });

          if (insertError) {
            console.error("Error creating buyer profile:", insertError);
            return { success: false, error: "DB Error: " + (insertError.message || JSON.stringify(insertError)) };
          }

          finalUser = newBuyerProfile;
          
          // Cleanup temp data
          setTempUserData(prev => { 
            const next = {...prev}; 
            delete next[normalizedEmail]; 
            return next; 
          });
        } else {
          // Existing user
          finalUser = {
            id: existingBuyer.id,
            name: existingBuyer.name || normalizedEmail.split("@")[0],
            email: existingBuyer.email,
            phone: existingBuyer.phone,
            country: existingBuyer.country,
            companyName: existingBuyer.company_name,
            address: existingBuyer.address,
          };
        }

        setUser(finalUser);
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || "An unexpected error occurred." };
      }
    },
    [tempUserData]
  );

  // ── Logout ──
  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  // ── Refresh Profile ──
  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from('buyers').select('*').eq('id', user.id).single();
    if (data) {
      setUser((prev) => prev ? {
        ...prev,
        name: data.name || prev.email.split("@")[0],
        phone: data.phone,
        country: data.country,
        companyName: data.company_name,
        address: data.address,
      } : null);
    }
  }, [user]);

  // ── Modal Controls ──
  const openAuthModal = useCallback((redirectUrl?: string) => {
    if (redirectUrl) setAuthRedirectUrl(redirectUrl);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    setTimeout(() => setAuthRedirectUrl(null), 300); // clear after animation
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        logout,
        openAuthModal,
        openLoginModal: openAuthModal,
        closeAuthModal,
        isAuthModalOpen,
        authRedirectUrl,
        isLoginModalOpen: isAuthModalOpen,
        isSignupModalOpen: isAuthModalOpen,
        closeAuthModals: closeAuthModal,
        openSignupModal: () => openAuthModal(),
        login: async () => ({ success: true }),
        signup: async () => ({ success: true }),
        checkUserExists,
        requestOTP,
        verifyOTP,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
