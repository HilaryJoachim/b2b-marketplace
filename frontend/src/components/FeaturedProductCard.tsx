"use client";

import React from "react";
import Image from "next/image";
import PriceDisplay from "@/components/PriceDisplay";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface Props {
  image: string;
  title: string;
  price: string;
  slug: string;
}

const FeaturedProductCard: React.FC<Props> = ({ image, title, price, slug }) => {
  const { user, openAuthModal } = useAuth();
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const productUrl = `/product/${slug}`;
    if (!user) {
      // Intercept for unauthenticated users
      openAuthModal(productUrl);
    } else {
      router.push(productUrl);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="flex flex-col h-full w-full text-left bg-white p-4 rounded-xl shadow-xs hover:shadow-lg border border-gray-100 transition-all duration-200 cursor-pointer group"
    >
      {/* Standardized Fixed Ratio Image Box */}
      <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-50 mb-3.5 shrink-0 flex items-center justify-center">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Content Section - Strict Uniform Alignment */}
      <div className="flex flex-col flex-1 justify-between w-full">
        <h3 className="text-base font-bold text-gray-900 group-hover:text-[#f36a1b] transition-colors line-clamp-2 leading-snug mb-2 min-h-[2.5rem]">
          {title}
        </h3>
        <div className="mt-auto pt-1">
          <PriceDisplay priceUsd={price} className="text-base font-extrabold text-[#f36a1b] block" />
        </div>
      </div>
    </button>
  );
};

export default FeaturedProductCard;

