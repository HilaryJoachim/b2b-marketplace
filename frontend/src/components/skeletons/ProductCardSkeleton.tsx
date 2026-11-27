/**
 * Skeleton loader that mirrors FeaturedProductCard layout.
 * Use inside a grid for realistic loading shimmer.
 */
export default function ProductCardSkeleton() {
  return (
    <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-100 animate-pulse flex flex-col h-full w-full">
      {/* Image placeholder */}
      <div className="w-full aspect-square bg-gray-200 rounded-lg mb-3.5" />
      {/* Title */}
      <div className="h-4 bg-gray-200 rounded-md w-3/4 mb-2" />
      <div className="h-4 bg-gray-200 rounded-md w-1/2 mb-4" />
      {/* Price */}
      <div className="mt-auto h-5 bg-gray-200 rounded-md w-1/3 mb-2.5" />
      {/* Company Name & Verified Badge skeleton */}
      <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
        <div className="h-3.5 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-200 rounded-full w-14" />
      </div>
    </div>
  );
}

/** Renders a grid of skeleton cards matching the product grid layout */
export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
