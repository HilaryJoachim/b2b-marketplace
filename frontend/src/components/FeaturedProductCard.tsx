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
  supplier?: string;
  isVerified?: boolean;
}

const FeaturedProductCard: React.FC<Props> = ({
  image,
  title,
  price,
  slug,
  supplier,
  isVerified = true,
}) => {
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

  const companyName = supplier || "Verified Supplier";

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

        <div className="mt-auto pt-1 space-y-2">
          {/* Price */}
          <PriceDisplay priceUsd={price} className="text-base font-extrabold text-[#f36a1b] block" />

          {/* Company Name & Verified Badge */}
          <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-gray-100 text-xs text-gray-600">
            <span
              className="truncate font-semibold text-gray-700 hover:text-gray-900 transition-colors"
              title={companyName}
            >
              {companyName}
            </span>

            {isVerified && (
              <span
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/80 shrink-0 shadow-2xs"
                title="Verified Company"
              >
                <svg
                  className="w-3.5 h-3.5 text-emerald-600 shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Verified</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
};

export default FeaturedProductCard;

