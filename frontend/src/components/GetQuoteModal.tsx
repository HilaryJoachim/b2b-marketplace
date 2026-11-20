"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useInquiries } from "@/context/InquiryContext";

interface GetQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  productTitle: string;
}

export default function GetQuoteModal({
  isOpen,
  onClose,
  productTitle,
}: GetQuoteModalProps) {
  const { user } = useAuth();
  const { addRFQ } = useInquiries();

  const [quantity, setQuantity] = useState("");
  const [country, setCountry] = useState("");
  const [requiredDate, setRequiredDate] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const modalRef = useRef<HTMLDivElement>(null);

  // Pre-fill message when modal opens or product changes
  useEffect(() => {
    if (isOpen) {
      setMessage(
        `I would like to request a quotation for ${productTitle}.`
      );
      setErrors({});
      setShowSuccess(false);
    }
  }, [isOpen, productTitle]);

  // Close on Escape key + lock body scroll
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
    if (!quantity.trim() || Number(quantity) <= 0) {
      newErrors.quantity = "Please enter a valid quantity (must be greater than 0)";
    }
    if (!country.trim()) {
      newErrors.country = "Delivery country is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Save RFQ to context + localStorage
    addRFQ({
      type: "rfq",
      buyerId: user?.id || "guest",
      buyerName: user?.name || "Guest User",
      buyerEmail: user?.email || "",
      productName: productTitle,
      supplierName: "KifaruTrade Industrial Solutions Ltd.",
      quantity: Number(quantity),
      country,
      requiredDate: requiredDate || undefined,
      message: message || undefined,
    });

    setIsSubmitting(false);
    setShowSuccess(true);

    // Auto-close after showing success
    setTimeout(() => {
      setShowSuccess(false);
      resetForm();
      onClose();
    }, 2500);
  };

  const resetForm = () => {
    setQuantity("");
    setCountry("");
    setRequiredDate("");
    setMessage("");
    setErrors({});
  };

  if (!isOpen) return null;

  // Today's date in YYYY-MM-DD for the date picker min value
  const today = new Date().toISOString().split("T")[0];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn" />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl animate-slideUp max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Request a Quote
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              RFQ for{" "}
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

        {/* Success State */}
        {showSuccess && (
          <div className="px-6 py-10 flex flex-col items-center text-center animate-fadeIn">
            <div className="w-14 h-14 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-7 h-7 text-green-600 dark:text-green-400"
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
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              Quotation Request Sent!
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              The supplier will review your request and respond soon.
            </p>
          </div>
        )}

        {/* Form */}
        {!showSuccess && (
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            {/* Quantity & Country — Side by Side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => {
                    setQuantity(e.target.value);
                    if (errors.quantity)
                      setErrors((prev) => ({ ...prev, quantity: "" }));
                  }}
                  placeholder="Enter quantity"
                  className={`w-full px-4 py-2.5 rounded-lg border text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary ${
                    errors.quantity
                      ? "border-red-400 focus:ring-red-400/40 focus:border-red-400"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                />
                {errors.quantity && (
                  <p className="mt-1 text-xs text-red-500">{errors.quantity}</p>
                )}
              </div>

              {/* Country / Delivery Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Delivery Country <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => {
                    setCountry(e.target.value);
                    if (errors.country)
                      setErrors((prev) => ({ ...prev, country: "" }));
                  }}
                  placeholder="e.g. Kenya, Nigeria"
                  className={`w-full px-4 py-2.5 rounded-lg border text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary ${
                    errors.country
                      ? "border-red-400 focus:ring-red-400/40 focus:border-red-400"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                />
                {errors.country && (
                  <p className="mt-1 text-xs text-red-500">{errors.country}</p>
                )}
              </div>
            </div>

            {/* Required Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Required By{" "}
                <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="date"
                min={today}
                value={requiredDate}
                onChange={(e) => setRequiredDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Additional Details{" "}
                <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder="Any specific requirements, certifications, packaging preferences..."
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-6 rounded-lg bg-secondary text-white font-semibold text-sm hover:bg-secondary-dark transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
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
                  Submitting Request...
                </>
              ) : (
                "Submit Quotation Request"
              )}
            </button>

            <p className="text-xs text-center text-gray-400 dark:text-gray-500 pt-1">
              Suppliers typically respond within 24–48 hours.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
