import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <h2 className="text-3xl font-extrabold text-[#002d1b] mb-2">404 - Page Not Found</h2>
      <p className="text-gray-500 text-sm mb-6 max-w-md">
        The page you are looking for does not exist or may have been moved.
      </p>
      <Link
        href="/"
        className="px-6 py-2.5 bg-[#f36a1b] hover:bg-[#d95a12] text-white rounded-xl font-semibold text-sm transition-colors shadow-xs"
      >
        Return to Home
      </Link>
    </div>
  );
}
