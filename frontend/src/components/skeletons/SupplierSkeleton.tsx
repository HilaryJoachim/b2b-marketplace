/**
 * Skeleton loader for the SupplierTrustCard sidebar.
 * Matches the compact trust card layout.
 */
export default function SupplierSkeleton() {
  return (
    <div className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm animate-pulse">
      {/* Header */}
      <div className="bg-gray-300 px-5 py-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 bg-gray-400/40 rounded-xl" />
          <div className="flex-1 space-y-1.5">
            <div className="h-4 bg-gray-400/40 rounded w-4/5" />
            <div className="h-3 bg-gray-400/40 rounded w-2/3" />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-4 space-y-4">
        {/* Badges */}
        <div className="flex gap-1.5">
          <div className="h-5 w-16 bg-gray-200 rounded-full" />
          <div className="h-5 w-14 bg-gray-200 rounded-full" />
          <div className="h-5 w-24 bg-gray-200 rounded-full" />
        </div>

        {/* Stats */}
        <div className="space-y-2.5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-gray-200 rounded-lg" />
              <div className="flex-1 flex items-center justify-between">
                <div className="h-3 bg-gray-200 rounded w-20" />
                <div className="h-3 bg-gray-200 rounded w-14" />
              </div>
            </div>
          ))}
        </div>

        {/* Export Tags */}
        <div className="pt-1 space-y-1.5">
          <div className="h-2.5 bg-gray-200 rounded w-16" />
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-4 w-14 bg-gray-200 rounded-full" />
            ))}
          </div>
        </div>

        {/* Stars */}
        <div className="flex items-center gap-2 pt-1">
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-3.5 h-3.5 bg-gray-200 rounded-sm" />
            ))}
          </div>
          <div className="h-3 w-6 bg-gray-200 rounded" />
          <div className="h-3 w-16 bg-gray-200 rounded" />
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 pb-4">
        <div className="h-9 bg-gray-200 rounded-lg w-full" />
      </div>
    </div>
  );
}
