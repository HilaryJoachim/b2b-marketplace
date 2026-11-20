import ProductDetailSkeleton from "@/components/skeletons/ProductDetailSkeleton";

/**
 * Next.js App Router loading boundary for product detail pages.
 * Shows a full-page skeleton while the async server component loads.
 */
export default function Loading() {
  return <ProductDetailSkeleton />;
}
