"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

// ── Types ──────────────────────────────────────────

export type InquiryStatus = "Sent" | "Viewed" | "Replied";
export type RFQStatus = "Pending" | "Viewed" | "Quotation Sent" | "Replied";

export interface Inquiry {
  id: string;
  type: "message";
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  productName: string;
  supplierName: string;
  message: string;
  phone?: string;
  createdAt: string;
  status: InquiryStatus;
}

export interface RFQ {
  id: string;
  type: "rfq";
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  productName: string;
  supplierName: string;
  quantity: number;
  country: string;
  requiredDate?: string;
  message?: string;
  createdAt: string;
  status: RFQStatus;
}

interface InquiryContextType {
  inquiries: Inquiry[];
  rfqs: RFQ[];
  addInquiry: (inquiry: Omit<Inquiry, "id" | "createdAt" | "status">) => void;
  addRFQ: (rfq: Omit<RFQ, "id" | "createdAt" | "status">) => void;
  getInquiriesByBuyer: (buyerId: string) => Inquiry[];
  getRFQsByBuyer: (buyerId: string) => RFQ[];
}

// ── Constants ──────────────────────────────────────

const INQUIRIES_KEY = "b2b_inquiries";
const RFQS_KEY = "b2b_rfqs";

// ── Mock status simulation ─────────────────────────
// Randomly assign statuses to older entries for realism

const INQUIRY_STATUSES: InquiryStatus[] = ["Sent", "Viewed", "Replied"];
const RFQ_STATUSES: RFQStatus[] = ["Pending", "Viewed", "Quotation Sent", "Replied"];

function randomStatus<T>(statuses: T[]): T {
  return statuses[Math.floor(Math.random() * statuses.length)];
}

// ── Helpers ────────────────────────────────────────

function generateId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function loadFromStorage<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToStorage<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ── Seed data for demo ─────────────────────────────

function getSeedInquiries(): Inquiry[] {
  return [
    {
      id: "inq_seed_001",
      type: "message",
      buyerId: "usr_demo_001",
      buyerName: "Hilary Joachim",
      buyerEmail: "hilary@kifarutrade.com",
      productName: "Excavator X200",
      supplierName: "KifaruTrade Industrial Solutions Ltd.",
      message: "Hello, I'm interested in your Excavator X200. Can you share pricing for bulk orders of 5+ units? We need delivery to Nairobi.",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: "Replied",
    },
    {
      id: "inq_seed_002",
      type: "message",
      buyerId: "usr_demo_001",
      buyerName: "Hilary Joachim",
      buyerEmail: "hilary@kifarutrade.com",
      productName: "Bulldozer D8",
      supplierName: "KifaruTrade Industrial Solutions Ltd.",
      message: "I need a Bulldozer D8 for a construction project in Mombasa. What's the lead time for delivery?",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      status: "Viewed",
    },
  ];
}

function getSeedRFQs(): RFQ[] {
  return [
    {
      id: "rfq_seed_001",
      type: "rfq",
      buyerId: "usr_demo_001",
      buyerName: "Hilary Joachim",
      buyerEmail: "hilary@kifarutrade.com",
      productName: "Tractor Pro 4x4",
      supplierName: "KifaruTrade Industrial Solutions Ltd.",
      quantity: 10,
      country: "Kenya",
      requiredDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      message: "We need 10 units for our agricultural expansion project. Please include CIF pricing.",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      status: "Quotation Sent",
    },
    {
      id: "rfq_seed_002",
      type: "rfq",
      buyerId: "usr_demo_001",
      buyerName: "Hilary Joachim",
      buyerEmail: "hilary@kifarutrade.com",
      productName: "Gold Mining Drill",
      supplierName: "KifaruTrade Industrial Solutions Ltd.",
      quantity: 3,
      country: "Tanzania",
      requiredDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      message: "Require 3 units urgently for a mining project in Geita region.",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      status: "Pending",
    },
  ];
}

// ── Context ────────────────────────────────────────

const InquiryContext = createContext<InquiryContextType | undefined>(undefined);

export function InquiryProvider({ children }: { children: ReactNode }) {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [rfqs, setRFQs] = useState<RFQ[]>([]);

  // Hydrate from localStorage on mount, seed if empty
  useEffect(() => {
    let storedInquiries = loadFromStorage<Inquiry>(INQUIRIES_KEY);
    if (storedInquiries.length === 0) {
      storedInquiries = getSeedInquiries();
      saveToStorage(INQUIRIES_KEY, storedInquiries);
    }
    setInquiries(storedInquiries);

    let storedRFQs = loadFromStorage<RFQ>(RFQS_KEY);
    if (storedRFQs.length === 0) {
      storedRFQs = getSeedRFQs();
      saveToStorage(RFQS_KEY, storedRFQs);
    }
    setRFQs(storedRFQs);
  }, []);

  // ── Add Inquiry ──
  const addInquiry = useCallback(
    (data: Omit<Inquiry, "id" | "createdAt" | "status">) => {
      const newInquiry: Inquiry = {
        ...data,
        id: generateId("inq"),
        createdAt: new Date().toISOString(),
        status: "Sent",
      };
      setInquiries((prev) => {
        const updated = [newInquiry, ...prev];
        saveToStorage(INQUIRIES_KEY, updated);
        return updated;
      });
    },
    []
  );

  // ── Add RFQ ──
  const addRFQ = useCallback(
    (data: Omit<RFQ, "id" | "createdAt" | "status">) => {
      const newRFQ: RFQ = {
        ...data,
        id: generateId("rfq"),
        createdAt: new Date().toISOString(),
        status: "Pending",
      };
      setRFQs((prev) => {
        const updated = [newRFQ, ...prev];
        saveToStorage(RFQS_KEY, updated);
        return updated;
      });
    },
    []
  );

  // ── Filters ──
  const getInquiriesByBuyer = useCallback(
    (buyerId: string) => inquiries.filter((i) => i.buyerId === buyerId),
    [inquiries]
  );

  const getRFQsByBuyer = useCallback(
    (buyerId: string) => rfqs.filter((r) => r.buyerId === buyerId),
    [rfqs]
  );

  return (
    <InquiryContext.Provider
      value={{
        inquiries,
        rfqs,
        addInquiry,
        addRFQ,
        getInquiriesByBuyer,
        getRFQsByBuyer,
      }}
    >
      {children}
    </InquiryContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────

export function useInquiries(): InquiryContextType {
  const context = useContext(InquiryContext);
  if (!context) {
    throw new Error("useInquiries must be used within an InquiryProvider");
  }
  return context;
}
