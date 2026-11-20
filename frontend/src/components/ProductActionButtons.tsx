"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import ContactSellerModal from "@/components/ContactSellerModal";
import GetQuoteModal from "@/components/GetQuoteModal";

interface ProductActionButtonsProps {
  productTitle: string;
}

export default function ProductActionButtons({
  productTitle,
}: ProductActionButtonsProps) {
  const { user, openLoginModal } = useAuth();
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);

  const handleContactClick = () => {
    if (!user) {
      openLoginModal();
      return;
    }
    setIsContactOpen(true);
  };

  const handleQuoteClick = () => {
    if (!user) {
      openLoginModal();
      return;
    }
    setIsQuoteOpen(true);
  };

  return (
    <>
      <div className="flex flex-wrap gap-4">
        <button
          onClick={handleContactClick}
          className="flex-1 bg-primary text-white font-semibold px-8 py-4 rounded-lg hover:bg-secondary transition-colors duration-300 shadow-sm cursor-pointer"
        >
          Contact Seller
        </button>
        <button
          onClick={handleQuoteClick}
          className="flex-1 border-2 border-primary text-primary font-semibold px-8 py-4 rounded-lg hover:bg-primary hover:text-white transition-colors duration-300 cursor-pointer"
        >
          Get Quote
        </button>
      </div>

      <ContactSellerModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        productTitle={productTitle}
      />

      <GetQuoteModal
        isOpen={isQuoteOpen}
        onClose={() => setIsQuoteOpen(false)}
        productTitle={productTitle}
      />
    </>
  );
}

