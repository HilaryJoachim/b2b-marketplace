import Image from "next/image";
import { Video, FileText } from "lucide-react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductBySlug, getRecommendedProducts } from "@/lib/data";
import ProductActionButtons from "@/components/ProductActionButtons";
import FeaturedProductCard from "@/components/FeaturedProductCard";
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
    <div className="max-w-7xl mx-auto p-4 sm:p-6 py-6 sm:py-12">
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

          {/* Product Description */}
          <div className="prose prose-gray dark:prose-invert my-2">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base whitespace-pre-line">
              {product.description || `High-quality ${product.title} supplied by ${product.supplier}. Built to withstand tough industrial conditions while maintaining optimal performance. Contact seller for technical details, customization, and pricing.`}
            </p>
          </div>

          <div className="mt-auto pt-6">
            {(product.youtube_url || product.pdf_url) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {product.youtube_url && (
                  <a
                    href={product.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3.5 p-3 rounded-xl border border-red-100 bg-gradient-to-r from-red-50/70 to-white hover:from-red-50 hover:to-red-100/50 hover:border-red-300 shadow-xs hover:shadow-md transition-all duration-200 group cursor-pointer"
                  >
                    {/* YouTube Red Play Icon */}
                    <div className="w-11 h-11 rounded-xl bg-[#FF0000] text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                      <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-gray-900 group-hover:text-red-600 transition-colors truncate">
                          Watch Video
                        </span>
                        <span className="text-[10px] uppercase font-bold text-red-600 bg-red-100/90 px-1.5 py-0.5 rounded">
                          Video
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        Product demo &amp; operation &rarr;
                      </p>
                    </div>
                  </a>
                )}

                {product.pdf_url && (
                  <a
                    href={product.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3.5 p-3 rounded-xl border border-rose-100 bg-gradient-to-r from-rose-50/70 to-white hover:from-rose-50 hover:to-rose-100/50 hover:border-rose-300 shadow-xs hover:shadow-md transition-all duration-200 group cursor-pointer"
                  >
                    {/* Adobe Red PDF Icon */}
                    <div className="w-11 h-11 rounded-xl bg-[#E5252A] text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                      <svg className="w-5 h-5 fill-none stroke-current" strokeWidth="2.2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <path d="M12 18v-6"/>
                        <path d="m9 15 3 3 3-3"/>
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-gray-900 group-hover:text-rose-600 transition-colors truncate">
                          Download PDF
                        </span>
                        <span className="text-[10px] uppercase font-bold text-rose-600 bg-rose-100/90 px-1.5 py-0.5 rounded">
                          PDF
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        Specifications &amp; brochure &rarr;
                      </p>
                    </div>
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
            <div key={prod.slug} className="h-full flex flex-col">
              <FeaturedProductCard
                image={prod.image}
                title={prod.title}
                price={prod.price}
                slug={prod.slug}
                supplier={prod.supplier}
                isVerified={true}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
