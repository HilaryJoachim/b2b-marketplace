interface EmptyCategoryProps {
  categoryName: string;
  onReset: () => void;
}

/**
 * Empty state for when a category filter returns no products.
 * Shows the category name and provides reset/browse buttons.
 */
export default function EmptyCategory({ categoryName, onReset }: EmptyCategoryProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-gray-50 dark:bg-gray-900 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
      {/* Icon */}
      <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center mb-5 shadow-sm">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-7 h-7 text-gray-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
          />
        </svg>
      </div>

      {/* Text */}
      <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
        No products in &ldquo;{categoryName}&rdquo;
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
        This category doesn&apos;t have any products yet. Try browsing a different category.
      </p>

      {/* Actions */}
      <div className="flex items-center gap-3 mt-5">
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#F36A1B] hover:bg-[#d95a12] text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
          </svg>
          Reset Filters
        </button>
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
        >
          Browse All
        </button>
      </div>
    </div>
  );
}
