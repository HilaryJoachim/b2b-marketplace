import Image from "next/image";
import { Video, FileText } from "lucide-react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductBySlug, getRecommendedProducts } from "@/lib/data";
import ProductActionButtons from "@/components/ProductActionButtons";
import ProductTabs from "@/components/product/ProductTabs";
import ProductAttributes from "@/components/product/ProductAttributes";
import ProductDescription from "@/components/product/ProductDescription";
import SupplierProfile from "@/components/product/SupplierProfile";
import SupplierTrustCard from "@/components/supplier/SupplierTrustCard";
import PriceDisplay from "@/components/PriceDisplay";
import ProductImageGallery from "@/components/product/ProductImageGallery";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  
  if (!product) return notFound();

  const recommended = await getRecommendedProducts(product.slug, 4);

  return (
    <div className="max-w-7xl mx-auto p-6 py-12">
      {/* ─── Product Hero ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Image Section */}
        <div className="lg:col-span-5">
          <ProductImageGallery 
            images={[product.image, ...(product.extra_images || [])].filter(Boolean) as string[]} 
            title={product.title} 
          />
        </div>

        {/* Product Info Section */}
        <div className="lg:col-span-4 flex flex-col">
          <p className="text-gray-500 font-medium mb-2 uppercase tracking-wide text-sm">{product.category}</p>
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">{product.title}</h1>
          <PriceDisplay priceUsd={product.price} className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 block" />

          <div className="prose prose-gray dark:prose-invert">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. This product is ideal for businesses
              seeking quality and reliability. Built to withstand tough conditions while maintaining optimal performance.
            </p>
          </div>

          <div className="mt-auto pt-8">
            {(product.youtube_url || product.pdf_url) && (
              <div className="flex flex-wrap gap-3 mb-6">
                {product.youtube_url && (
                  <a href={product.youtube_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors">
                    <Video className="w-4 h-4" /> Watch Video
                  </a>
                )}
                {product.pdf_url && (
                  <a href={product.pdf_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors">
                    <FileText className="w-4 h-4" /> Download PDF
                  </a>
                )}
              </div>
            )}
            <ProductActionButtons 
              productTitle={product.title} 
              productId={product.id} 
              supplierId={product.supplier_id} 
            />
          </div>
        </div>
        {/* Supplier Trust Card */}
        <div className="lg:col-span-3">
          <div className="lg:sticky lg:top-24">
            <SupplierTrustCard supplierDetails={product.supplier_details} />
          </div>
        </div>
      </div>

      {/* ─── Product Information Tabs & Sections ─── */}
      <div className="mt-16">
        <ProductTabs />

        <div className="divide-y divide-gray-100">
          <ProductAttributes specifications={product.specifications} />
          <ProductDescription description={product.description} />
          <SupplierProfile 
            supplierDetails={product.supplier_details} 
            productId={product.id}
            productTitle={product.title}
            supplierId={product.supplier_id}
          />
        </div>
      </div>

      {/* ─── Recommendations ─── */}
      <div className="mt-24 border-t border-gray-200 dark:border-gray-800 pt-16">
        <h2 className="text-2xl font-bold mb-8 text-gray-900 dark:text-white">Other recommendations for your business</h2>
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
          {recommended.map((prod) => (
            <Link key={prod.slug} href={`/product/${prod.slug}`} className="group block bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 rounded-xl hover:shadow-md transition-shadow">
              <div className="rounded-lg overflow-hidden mb-4 bg-gray-50 dark:bg-gray-800 aspect-video">
                <Image 
                  src={prod.image} 
                  alt={prod.title} 
                  width={300} 
                  height={200} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-primary transition-colors">{prod.title}</h3>
              <PriceDisplay priceUsd={prod.price} className="text-lg font-bold text-gray-700 dark:text-gray-300 block" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
