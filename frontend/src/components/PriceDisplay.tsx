"use client";

import { useCountry } from "@/context/CountryContext";
import { parseUsdPrice } from "@/lib/formatPrice";

interface PriceDisplayProps {
  /** The original USD price string from product data, e.g. "$25,000" */
  priceUsd: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Client component that displays a product price converted to the user's
 * selected delivery country currency. Reads from CountryContext.
 *
 * Usage: <PriceDisplay priceUsd={product.price} className="text-lg font-bold" />
 */
export default function PriceDisplay({ priceUsd, className = "" }: PriceDisplayProps) {
  const { formatPrice, country } = useCountry();
  const usdAmount = parseUsdPrice(priceUsd);
  const displayPrice = formatPrice(usdAmount);

  return (
    <span className={className} title={`${priceUsd} USD`}>
      {displayPrice}
    </span>
  );
}
