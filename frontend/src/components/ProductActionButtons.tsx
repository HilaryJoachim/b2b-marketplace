"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import ContactSellerModal from "@/components/ContactSellerModal";
import GetQuoteModal from "@/components/GetQuoteModal";

interface ProductActionButtonsProps {
  productTitle: string;
  productId?: string;
  supplierId?: string;
}

export default function ProductActionButtons({
  productTitle,
  productId,
  supplierId,
}: ProductActionButtonsProps) {
  const { user, openLoginModal } = useAuth();
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);

  const handleContactClick = () => {
    setIsContactOpen(true);
  };

  const handleQuoteClick = () => {
    setIsQuoteOpen(true);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <button
          onClick={handleContactClick}
          className="flex-1 bg-primary text-white font-semibold px-6 sm:px-8 py-3.5 sm:py-4 rounded-lg hover:bg-secondary transition-colors duration-300 shadow-sm cursor-pointer text-center"
        >
          Contact Seller
        </button>
        <button
          onClick={handleQuoteClick}
          className="flex-1 border-2 border-primary text-primary font-semibold px-6 sm:px-8 py-3.5 sm:py-4 rounded-lg hover:bg-primary hover:text-white transition-colors duration-300 cursor-pointer text-center"
        >
          Get Quote
        </button>
      </div>

      <ContactSellerModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        productTitle={productTitle}
        productId={productId}
        supplierId={supplierId}
      />

      <GetQuoteModal
        isOpen={isQuoteOpen}
        onClose={() => setIsQuoteOpen(false)}
        productTitle={productTitle}
        productId={productId}
        supplierId={supplierId}
      />
    </>
  );
}

