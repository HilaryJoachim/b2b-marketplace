/**
 * Skeleton loader for the category sidebar on the homepage.
 * Matches the sidebar layout with category buttons.
 */
export default function CategorySidebarSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-24 mx-auto mb-4" />
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center space-x-3 px-3 py-2.5">
            <div className="w-6 h-6 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded flex-1" />
          </div>
        ))}
      </div>
    </div>
  );
}
