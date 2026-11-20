/**
 * Full-page skeleton loader for the product detail page.
 * Matches the 3-column hero layout (image, info, trust card)
 * plus tabs and recommendations sections to prevent layout shift.
 */
export default function ProductDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto p-6 py-12 animate-pulse">
      {/* ── Hero ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Image */}
        <div className="lg:col-span-5">
          <div className="w-full aspect-[4/3] bg-gray-200 rounded-xl" />
          <div className="mt-4 flex gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-20 h-20 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="lg:col-span-4 space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-9 bg-gray-200 rounded-lg w-4/5" />
          <div className="h-8 bg-gray-200 rounded-lg w-1/3" />
          <div className="space-y-2 pt-2">
            <div className="h-3.5 bg-gray-200 rounded w-full" />
            <div className="h-3.5 bg-gray-200 rounded w-5/6" />
            <div className="h-3.5 bg-gray-200 rounded w-4/6" />
          </div>
          <div className="flex gap-4 pt-6">
            <div className="h-12 bg-gray-200 rounded-lg flex-1" />
            <div className="h-12 bg-gray-200 rounded-lg flex-1" />
          </div>
        </div>

        {/* Trust Card */}
        <div className="lg:col-span-3">
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="h-16 bg-gray-300 rounded-t-xl" />
            <div className="p-5 space-y-3">
              <div className="flex gap-2">
                <div className="h-6 w-16 bg-gray-200 rounded-full" />
                <div className="h-6 w-14 bg-gray-200 rounded-full" />
              </div>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="w-7 h-7 bg-gray-200 rounded-lg" />
                  <div className="h-3.5 bg-gray-200 rounded flex-1" />
                </div>
              ))}
              <div className="flex gap-1 pt-1">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-5 w-14 bg-gray-200 rounded-full" />
                ))}
              </div>
              <div className="h-9 bg-gray-200 rounded-lg w-full mt-2" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="mt-16 space-y-6">
        <div className="flex gap-8 border-b border-gray-200 pb-3">
          <div className="h-5 w-20 bg-gray-200 rounded" />
          <div className="h-5 w-24 bg-gray-200 rounded" />
          <div className="h-5 w-28 bg-gray-200 rounded" />
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
          <div className="h-4 bg-gray-200 rounded w-4/6" />
        </div>
      </div>

      {/* ── Recommendations ── */}
      <div className="mt-24 border-t border-gray-200 pt-16">
        <div className="h-7 bg-gray-200 rounded w-72 mb-8" />
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white border border-gray-100 p-4 rounded-xl">
              <div className="w-full aspect-video bg-gray-200 rounded-lg mb-4" />
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
