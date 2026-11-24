"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useInquiries } from "@/context/InquiryContext";
import { supabase } from "@/utils/supabase/client";

interface ContactSellerModalProps {
  isOpen: boolean;
  onClose: () => void;
  productTitle: string;
  productId?: string;
  supplierId?: string;
}

export default function ContactSellerModal({
  isOpen,
  onClose,
  productTitle,
  productId,
  supplierId,
}: ContactSellerModalProps) {
  const { user } = useAuth();
  const { addInquiry } = useInquiries();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const modalRef = useRef<HTMLDivElement>(null);

  // Sync user info and prefill form
  useEffect(() => {
    if (user) {
      if (user.name) setName(user.name);
      if (user.email) setEmail(user.email);
      if (user.phone) setPhone(user.phone);
    } else if (typeof window !== "undefined") {
      const savedEmail = localStorage.getItem("kifaru_buyer_email");
      const savedName = localStorage.getItem("kifaru_buyer_name");
      if (savedName && !name) setName(savedName);
      if (savedEmail && !email) setEmail(savedEmail);
    }
  }, [user, isOpen]);

  // Pre-fill message and user info when modal opens or product changes
  useEffect(() => {
    if (isOpen) {
      setMessage(
        `Hello, I'm interested in your product '${productTitle}'. Please share more details.`
      );
      setErrors({});
      setShowSuccess(false);
    }
  }, [isOpen, productTitle]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  // Close when clicking backdrop
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!message.trim()) newErrors.message = "Message is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      // Resolve supplierId if not passed directly
      let effectiveSupplierId = supplierId;
      if (!effectiveSupplierId && productId) {
        const { data: prodData } = await supabase
          .from('products')
          .select('supplier_id')
          .eq('id', productId)
          .single();
        if (prodData?.supplier_id) {
          effectiveSupplierId = prodData.supplier_id;
        }
      }

      // If still no supplierId, fallback to the registered supplier
      if (!effectiveSupplierId) {
        const { data: supData } = await supabase
          .from('suppliers')
          .select('id')
          .limit(1)
          .single();
        if (supData?.id) {
          effectiveSupplierId = supData.id;
        }
      }

      const initialMessage = {
        id: `m_${Date.now()}`,
        type: 'product_inquiry',
        sender: 'buyer',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: message.trim(),
        product: {
          id: productId || null,
          title: productTitle
        }
      };

      // Insert inquiry into Supabase `leads` table so it shows on seller portal!
      const { error: leadError } = await supabase.from('leads').insert({
        supplier_id: effectiveSupplierId || null,
        buyer_name: name.trim(),
        buyer_email: email.trim(),
        buyer_phone: phone.trim() || null,
        buyer_location: user?.country || 'Online',
        message: JSON.stringify([initialMessage]),
        is_product_inquiry: true,
        product_id: productId || null,
        unread_count: 1
      });

      if (leadError) {
        console.error('Failed to save lead to database:', leadError);
      }

      // Save buyer email to localStorage so the buyer sees their messages even if browsing as guest
      if (email.trim() && typeof window !== 'undefined') {
        localStorage.setItem('kifaru_buyer_email', email.trim());
        localStorage.setItem('kifaru_buyer_name', name.trim());
      }

      // Save inquiry to context + localStorage for buyer history
      addInquiry({
        type: "message",
        buyerId: user?.id || "guest",
        buyerName: name,
        buyerEmail: email,
        phone: phone || undefined,
        productName: productTitle,
        supplierName: "Verified Supplier",
        message,
      });

      setShowSuccess(true);

      // Auto-close after showing success
      setTimeout(() => {
        setShowSuccess(false);
        resetForm();
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Error submitting contact form:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setMessage("");
    setErrors({});
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl animate-[slideUp_0.3s_ease-out] max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Contact Supplier
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Send an inquiry about{" "}
              <span className="font-medium text-primary">{productTitle}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Close modal"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Success Toast */}
        {showSuccess && (
          <div className="mx-6 mt-4 flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl animate-[fadeIn_0.3s_ease-out]">
            <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4 text-green-600 dark:text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-green-800 dark:text-green-300">
                Inquiry sent successfully!
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
                Seller will respond soon.
              </p>
            </div>
          </div>
        )}

        {/* Form */}
        {!showSuccess && (
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                }}
                placeholder="e.g. John Mwangi"
                className={`w-full px-4 py-2.5 rounded-lg border text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary ${
                  errors.name
                    ? "border-red-400 focus:ring-red-400/40 focus:border-red-400"
                    : "border-gray-200 dark:border-gray-700"
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email)
                    setErrors((prev) => ({ ...prev, email: "" }));
                }}
                placeholder="e.g. john@company.co.ke"
                className={`w-full px-4 py-2.5 rounded-lg border text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary ${
                  errors.email
                    ? "border-red-400 focus:ring-red-400/40 focus:border-red-400"
                    : "border-gray-200 dark:border-gray-700"
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Phone Number{" "}
                <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +254 712 345 678"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              />
            </div>

            {/* Message Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  if (errors.message)
                    setErrors((prev) => ({ ...prev, message: "" }));
                }}
                rows={4}
                placeholder="Describe what you're looking for..."
                className={`w-full px-4 py-2.5 rounded-lg border text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary resize-none ${
                  errors.message
                    ? "border-red-400 focus:ring-red-400/40 focus:border-red-400"
                    : "border-gray-200 dark:border-gray-700"
                }`}
              />
              {errors.message && (
                <p className="mt-1 text-xs text-red-500">{errors.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-6 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
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
                  Sending Inquiry...
                </>
              ) : (
                "Send Inquiry"
              )}
            </button>

            <p className="text-xs text-center text-gray-400 dark:text-gray-500 pt-1">
              Your inquiry will be sent directly to the supplier.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
