"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

// ── Country + Currency Data ──
export interface CountryInfo {
  code: string;
  flag: string;
  name: string;
  currency: string;
  currencySymbol: string;
  exchangeRate: number; // 1 USD = X local currency
}

export const COUNTRIES: CountryInfo[] = [
  // ── African Countries (54) ──
  { code: "DZ", flag: "🇩🇿", name: "Algeria",                currency: "DZD", currencySymbol: "د.ج",  exchangeRate: 134.5 },
  { code: "AO", flag: "🇦🇴", name: "Angola",                 currency: "AOA", currencySymbol: "Kz",   exchangeRate: 835 },
  { code: "BJ", flag: "🇧🇯", name: "Benin",                  currency: "XOF", currencySymbol: "CFA",  exchangeRate: 605 },
  { code: "BW", flag: "🇧🇼", name: "Botswana",               currency: "BWP", currencySymbol: "P",    exchangeRate: 13.6 },
  { code: "BF", flag: "🇧🇫", name: "Burkina Faso",           currency: "XOF", currencySymbol: "CFA",  exchangeRate: 605 },
  { code: "BI", flag: "🇧🇮", name: "Burundi",                currency: "BIF", currencySymbol: "FBu",  exchangeRate: 2860 },
  { code: "CV", flag: "🇨🇻", name: "Cabo Verde",             currency: "CVE", currencySymbol: "Esc",  exchangeRate: 101.5 },
  { code: "CM", flag: "🇨🇲", name: "Cameroon",               currency: "XAF", currencySymbol: "FCFA", exchangeRate: 605 },
  { code: "CF", flag: "🇨🇫", name: "Central African Rep.",   currency: "XAF", currencySymbol: "FCFA", exchangeRate: 605 },
  { code: "TD", flag: "🇹🇩", name: "Chad",                   currency: "XAF", currencySymbol: "FCFA", exchangeRate: 605 },
  { code: "KM", flag: "🇰🇲", name: "Comoros",                currency: "KMF", currencySymbol: "CF",   exchangeRate: 453 },
  { code: "CD", flag: "🇨🇩", name: "DR Congo",               currency: "CDF", currencySymbol: "FC",   exchangeRate: 2750 },
  { code: "CG", flag: "🇨🇬", name: "Congo Republic",         currency: "XAF", currencySymbol: "FCFA", exchangeRate: 605 },
  { code: "CI", flag: "🇨🇮", name: "Côte d'Ivoire",          currency: "XOF", currencySymbol: "CFA",  exchangeRate: 605 },
  { code: "DJ", flag: "🇩🇯", name: "Djibouti",               currency: "DJF", currencySymbol: "Fdj",  exchangeRate: 178 },
  { code: "EG", flag: "🇪🇬", name: "Egypt",                  currency: "EGP", currencySymbol: "E£",   exchangeRate: 49.5 },
  { code: "GQ", flag: "🇬🇶", name: "Equatorial Guinea",      currency: "XAF", currencySymbol: "FCFA", exchangeRate: 605 },
  { code: "ER", flag: "🇪🇷", name: "Eritrea",                currency: "ERN", currencySymbol: "Nfk",  exchangeRate: 15 },
  { code: "SZ", flag: "🇸🇿", name: "Eswatini",               currency: "SZL", currencySymbol: "E",    exchangeRate: 18.5 },
  { code: "ET", flag: "🇪🇹", name: "Ethiopia",               currency: "ETB", currencySymbol: "Br",   exchangeRate: 57 },
  { code: "GA", flag: "🇬🇦", name: "Gabon",                  currency: "XAF", currencySymbol: "FCFA", exchangeRate: 605 },
  { code: "GM", flag: "🇬🇲", name: "Gambia",                 currency: "GMD", currencySymbol: "D",    exchangeRate: 68 },
  { code: "GH", flag: "🇬🇭", name: "Ghana",                  currency: "GHS", currencySymbol: "GH₵",  exchangeRate: 15.8 },
  { code: "GN", flag: "🇬🇳", name: "Guinea",                 currency: "GNF", currencySymbol: "FG",   exchangeRate: 8600 },
  { code: "GW", flag: "🇬🇼", name: "Guinea-Bissau",          currency: "XOF", currencySymbol: "CFA",  exchangeRate: 605 },
  { code: "KE", flag: "🇰🇪", name: "Kenya",                  currency: "KES", currencySymbol: "KSh",  exchangeRate: 129 },
  { code: "LS", flag: "🇱🇸", name: "Lesotho",                currency: "LSL", currencySymbol: "L",    exchangeRate: 18.5 },
  { code: "LR", flag: "🇱🇷", name: "Liberia",                currency: "LRD", currencySymbol: "L$",   exchangeRate: 192 },
  { code: "LY", flag: "🇱🇾", name: "Libya",                  currency: "LYD", currencySymbol: "LD",   exchangeRate: 4.85 },
  { code: "MG", flag: "🇲🇬", name: "Madagascar",             currency: "MGA", currencySymbol: "Ar",   exchangeRate: 4550 },
  { code: "MW", flag: "🇲🇼", name: "Malawi",                 currency: "MWK", currencySymbol: "MK",   exchangeRate: 1720 },
  { code: "ML", flag: "🇲🇱", name: "Mali",                   currency: "XOF", currencySymbol: "CFA",  exchangeRate: 605 },
  { code: "MR", flag: "🇲🇷", name: "Mauritania",             currency: "MRU", currencySymbol: "UM",   exchangeRate: 39.5 },
  { code: "MU", flag: "🇲🇺", name: "Mauritius",              currency: "MUR", currencySymbol: "₨",    exchangeRate: 45.5 },
  { code: "MA", flag: "🇲🇦", name: "Morocco",                currency: "MAD", currencySymbol: "MAD",  exchangeRate: 10.1 },
  { code: "MZ", flag: "🇲🇿", name: "Mozambique",             currency: "MZN", currencySymbol: "MT",   exchangeRate: 63.5 },
  { code: "NA", flag: "🇳🇦", name: "Namibia",                currency: "NAD", currencySymbol: "N$",   exchangeRate: 18.5 },
  { code: "NE", flag: "🇳🇪", name: "Niger",                  currency: "XOF", currencySymbol: "CFA",  exchangeRate: 605 },
  { code: "NG", flag: "🇳🇬", name: "Nigeria",                currency: "NGN", currencySymbol: "₦",    exchangeRate: 1550 },
  { code: "RW", flag: "🇷🇼", name: "Rwanda",                 currency: "RWF", currencySymbol: "FRw",  exchangeRate: 1280 },
  { code: "ST", flag: "🇸🇹", name: "São Tomé & Príncipe",    currency: "STN", currencySymbol: "Db",   exchangeRate: 22.5 },
  { code: "SN", flag: "🇸🇳", name: "Senegal",                currency: "XOF", currencySymbol: "CFA",  exchangeRate: 605 },
  { code: "SC", flag: "🇸🇨", name: "Seychelles",             currency: "SCR", currencySymbol: "₨",    exchangeRate: 14.2 },
  { code: "SL", flag: "🇸🇱", name: "Sierra Leone",           currency: "SLE", currencySymbol: "Le",   exchangeRate: 22.5 },
  { code: "SO", flag: "🇸🇴", name: "Somalia",                currency: "SOS", currencySymbol: "Sh",   exchangeRate: 571 },
  { code: "ZA", flag: "🇿🇦", name: "South Africa",           currency: "ZAR", currencySymbol: "R",    exchangeRate: 18.5 },
  { code: "SS", flag: "🇸🇸", name: "South Sudan",            currency: "SSP", currencySymbol: "SS£",  exchangeRate: 1380 },
  { code: "SD", flag: "🇸🇩", name: "Sudan",                  currency: "SDG", currencySymbol: "ج.س",  exchangeRate: 601 },
  { code: "TZ", flag: "🇹🇿", name: "Tanzania",               currency: "TZS", currencySymbol: "TSh",  exchangeRate: 2600 },
  { code: "TG", flag: "🇹🇬", name: "Togo",                   currency: "XOF", currencySymbol: "CFA",  exchangeRate: 605 },
  { code: "TN", flag: "🇹🇳", name: "Tunisia",                currency: "TND", currencySymbol: "DT",   exchangeRate: 3.12 },
  { code: "UG", flag: "🇺🇬", name: "Uganda",                 currency: "UGX", currencySymbol: "USh",  exchangeRate: 3750 },
  { code: "ZM", flag: "🇿🇲", name: "Zambia",                 currency: "ZMW", currencySymbol: "ZK",   exchangeRate: 26.5 },
  { code: "ZW", flag: "🇿🇼", name: "Zimbabwe",               currency: "ZWL", currencySymbol: "Z$",   exchangeRate: 14200 },

  // ── Global Trading Partners ──
  { code: "US", flag: "🇺🇸", name: "United States",          currency: "USD", currencySymbol: "$",    exchangeRate: 1 },
  { code: "IN", flag: "🇮🇳", name: "India",                  currency: "INR", currencySymbol: "₹",    exchangeRate: 83.5 },
  { code: "AE", flag: "🇦🇪", name: "UAE",                    currency: "AED", currencySymbol: "د.إ",  exchangeRate: 3.67 },
  { code: "CN", flag: "🇨🇳", name: "China",                  currency: "CNY", currencySymbol: "¥",    exchangeRate: 7.25 },
  { code: "GB", flag: "🇬🇧", name: "United Kingdom",         currency: "GBP", currencySymbol: "£",    exchangeRate: 0.79 },
];

const STORAGE_KEY = "b2b_delivery_country";
const DEFAULT_COUNTRY = COUNTRIES.find((c) => c.code === "US") || COUNTRIES[0];

// ── Context Shape ──
interface CountryContextValue {
  country: CountryInfo;
  setCountry: (country: CountryInfo) => void;
  formatPrice: (usdAmount: number) => string;
  convertPrice: (usdAmount: number) => number;
}

const CountryContext = createContext<CountryContextValue | null>(null);

// ── Provider ──
export function CountryProvider({ children }: { children: ReactNode }) {
  const [country, setCountryState] = useState<CountryInfo>(DEFAULT_COUNTRY);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const match = COUNTRIES.find((c) => c.code === parsed.code);
        if (match) setCountryState(match);
      }
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  const setCountry = useCallback((c: CountryInfo) => {
    setCountryState(c);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ code: c.code }));
    } catch {
      // ignore
    }
  }, []);

  const convertPrice = useCallback(
    (usdAmount: number): number => {
      return usdAmount * country.exchangeRate;
    },
    [country.exchangeRate]
  );

  const formatPrice = useCallback(
    (usdAmount: number): string => {
      const converted = convertPrice(usdAmount);

      // For large currencies (TZS, UGX, NGN, etc.) drop decimals
      const useDecimals = country.exchangeRate < 100;

      const formatted = converted.toLocaleString("en-US", {
        minimumFractionDigits: useDecimals ? 2 : 0,
        maximumFractionDigits: useDecimals ? 2 : 0,
      });

      return `${country.currencySymbol} ${formatted}`;
    },
    [country.currencySymbol, country.exchangeRate, convertPrice]
  );

  // Don't render children until hydrated to prevent mismatch
  if (!hydrated) {
    return <>{children}</>;
  }

  return (
    <CountryContext.Provider value={{ country, setCountry, formatPrice, convertPrice }}>
      {children}
    </CountryContext.Provider>
  );
}

// ── Hook ──
export function useCountry(): CountryContextValue {
  const ctx = useContext(CountryContext);
  if (!ctx) {
    // Fallback for server components or outside provider
    return {
      country: DEFAULT_COUNTRY,
      setCountry: () => {},
      formatPrice: (usd: number) => `$ ${usd.toLocaleString("en-US")}`,
      convertPrice: (usd: number) => usd,
    };
  }
  return ctx;
}
