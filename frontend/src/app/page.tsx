"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import CategoryCard from "@/components/CategoryCard";
import FeaturedProductCard from "@/components/FeaturedProductCard";
import { Menu, X } from "lucide-react";
import HeroSection from "@/components/home/HeroSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import CtaSection from "@/components/home/CtaSection";
import { getProducts, getCategories, Product, Category } from "@/lib/data";
import { ProductGridSkeleton } from "@/components/skeletons/ProductCardSkeleton";
import CategorySidebarSkeleton from "@/components/skeletons/CategorySidebarSkeleton";
import EmptyCategory from "@/components/empty/EmptyCategory";
import EmptyProducts from "@/components/empty/EmptyProducts";

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeSearch, setActiveSearch] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(6);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const categoryFromUrl = searchParams.get("category");
      const activeCat = categoryFromUrl ? decodeURIComponent(categoryFromUrl) : null;
      
      const searchFromUrl = searchParams.get("q");
      const activeQuery = searchFromUrl ? decodeURIComponent(searchFromUrl) : null;
      
      setActiveCategory(activeCat);
      setActiveSearch(activeQuery);
      
      const [fetchedProducts, fetchedCategories] = await Promise.all([
        getProducts(activeCat, activeQuery),
        getCategories()
      ]);
      
      setProducts(fetchedProducts);
      setCategories(fetchedCategories);
      setLoading(false);
    };
    
    fetchData();
  }, [searchParams]);

  const handleCategoryChange = (category: string | null) => {
    const params = new URLSearchParams(searchParams.toString());

    if (category) {
      params.set("category", encodeURIComponent(category));
    } else {
      params.delete("category");
    }

    setVisibleCount(6);
    router.push(`/?${params.toString()}`, { scroll: false });
  };

  const visibleProducts = products.slice(0, visibleCount);
  const toggleMobileFilter = () => setMobileFilterOpen(!mobileFilterOpen);

  return (
    <div className="bg-white text-gray-900 dark:bg-gray-950 dark:text-white font-sans">
      <HeroSection />

      {/* Mobile Filter Button */}
      <div className="md:hidden px-4 mt-8 flex justify-between items-center max-w-7xl mx-auto">
        <h2 className="text-lg font-semibold">Products</h2>
        <button
          onClick={toggleMobileFilter}
          className="text-sm text-accent border border-accent px-3 py-1 rounded flex items-center gap-1"
        >
          {mobileFilterOpen ? <X size={16} /> : <Menu size={16} />} Filters
        </button>
      </div>

      {/* Main Grid Layout */}
      <div className="flex flex-col md:flex-row w-full max-w-7xl mx-auto px-4 gap-6 mt-8">
        {/* Sidebar */}
        <aside
          className={`md:w-1/4 w-full bg-gray-50 dark:bg-gray-900 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 md:block ${mobileFilterOpen ? "block" : "hidden"}`}
        >
          {loading ? (
            <CategorySidebarSkeleton />
          ) : (
            <>
              <h2 className="text-lg font-semibold mb-4 text-center">Categories</h2>
              <div className="space-y-3">
                <button
                  onClick={() => handleCategoryChange(null)}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors duration-200 ${
                    activeCategory === null
                      ? "bg-primary text-white shadow-sm"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <div className="w-6 h-6 relative bg-white rounded flex items-center justify-center p-0.5">
                    <Image src="/icons/all.png" alt="All Categories" fill className="object-contain p-1" />
                  </div>
                  <span className="text-sm font-medium">All Categories</span>
                </button>

                {categories.map((cat) => (
                  <button
                    key={cat.label}
                    onClick={() =>
                      handleCategoryChange(activeCategory === cat.label ? null : cat.label)
                    }
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors duration-200 ${
                      activeCategory === cat.label
                        ? "bg-primary text-white shadow-sm"
                        : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <div className="w-6 h-6 relative bg-white rounded flex items-center justify-center p-0.5">
                      <Image src={cat.icon} alt={cat.label} fill className="object-contain p-1" />
                    </div>
                    <span className="text-sm font-medium">{cat.label}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </aside>

        {/* Right Content */}
        <main className="md:w-3/4 w-full">
          <section id="products" className="pt-2 pb-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
              {activeSearch ? `Search Results for "${activeSearch}"` : (activeCategory ? `${activeCategory}` : "Featured Products")}
            </h2>
            
            {loading ? (
              <ProductGridSkeleton count={6} />
            ) : products.length > 0 ? (
              <>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {visibleProducts.map((product, index) => (
                    <div
                      key={product.slug + index}
                      className="animate-fadeInUp"
                      style={{ animationDelay: `${index * 60}ms` }}
                    >
                      <FeaturedProductCard
                        image={product.image}
                        title={product.title}
                        price={product.price}
                        slug={product.slug}
                      />
                    </div>
                  ))}
                </div>

                {visibleCount < products.length && (
                  <div className="text-center mt-10">
                    <button
                      onClick={() => setVisibleCount((prev) => prev + 6)}
                      className="px-8 py-3 bg-white dark:bg-gray-800 border-2 border-primary text-primary font-semibold rounded-lg shadow-sm hover:bg-primary hover:text-white transition-all duration-300 cursor-pointer"
                    >
                      Load More Products
                    </button>
                  </div>
                )}
              </>
            ) : activeCategory ? (
              <EmptyCategory
                categoryName={activeCategory}
                onReset={() => handleCategoryChange(null)}
              />
            ) : (
              <EmptyProducts />
            )}
          </section>
        </main>
      </div>

      <FeaturesSection />
      
      <div className="px-4 pb-16">
        <CtaSection />
      </div>
    </div>
  );
}

