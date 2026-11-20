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
      className="block w-full text-left bg-white p-4 rounded-lg shadow hover:shadow-lg transition cursor-pointer"
    >
      <Image
        src={image}
        alt={title}
        width={300}
        height={200}
        className="rounded-lg object-cover w-full h-auto"
      />
      <h3 className="mt-3 text-lg font-semibold">{title}</h3>
      <PriceDisplay priceUsd={price} className="text-sm text-[#b76e2b] font-medium mt-1 block" />
    </button>
  );
};

export default FeaturedProductCard;

