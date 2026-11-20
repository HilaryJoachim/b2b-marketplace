import ProductUploadForm from "@/components/supplier/ProductUploadForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AddProductPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="mb-6">
        <Link 
          href="/supplier/dashboard" 
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Add New Product
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Fill in the details below to list a new product on the marketplace.
        </p>
      </div>

      <ProductUploadForm />
    </div>
  );
}
