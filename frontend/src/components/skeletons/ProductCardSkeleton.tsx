/**
 * Skeleton loader that mirrors FeaturedProductCard layout.
 * Use inside a grid for realistic loading shimmer.
 */
export default function ProductCardSkeleton() {
  return (
    <div className="bg-white p-4 rounded-lg shadow animate-pulse">
      {/* Image placeholder */}
      <div className="w-full aspect-[3/2] bg-gray-200 rounded-lg" />
      {/* Title */}
      <div className="mt-3 h-5 bg-gray-200 rounded-md w-3/4" />
      {/* Price */}
      <div className="mt-2 h-4 bg-gray-200 rounded-md w-1/3" />
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
