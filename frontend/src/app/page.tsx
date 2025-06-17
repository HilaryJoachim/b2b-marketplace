"use client";

import { useState } from "react";
import Image from "next/image";
import Navbar from "@/components/navbar";
import CategoryCard from "@/components/CategoryCard";
import FeaturedProductCard from "@/components/FeaturedProductCard";
import { Menu, X } from "lucide-react"; // Use Lucide icons

const categories = [
  { icon: "/icons/construction.png", label: "Construction Equipment" },
  { icon: "/icons/agriculture.png", label: "Agricultural Machinery" },
  { icon: "/icons/mining.png", label: "Mining Tools" },
  { icon: "/icons/industrial.png", label: "Industrial Parts" },
];

const allProducts = [
  { image: "/products/product1.jpg", title: "Excavator X200", price: "$25,000", category: "Construction Equipment" },
  { image: "/products/product2.jpg", title: "Tractor Pro 4x4", price: "$18,500", category: "Agricultural Machinery" },
  { image: "/products/product3.jpg", title: "Gold Mining Drill", price: "$12,000", category: "Mining Tools" },
  { image: "/products/product4.jpg", title: "Industrial Conveyor", price: "$7,800", category: "Industrial Parts" },
  { image: "/products/product5.jpg", title: "Bulldozer D8", price: "$34,000", category: "Construction Equipment" },
  { image: "/products/product6.jpg", title: "Seed Planter Pro", price: "$9,000", category: "Agricultural Machinery" },
  { image: "/products/product7.jpg", title: "Ore Crusher 3000", price: "$19,800", category: "Mining Tools" },
  { image: "/products/product8.jpg", title: "Hydraulic Jack", price: "$2,500", category: "Industrial Parts" },
  // Add more as needed
];

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(6);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const filteredProducts = activeCategory
    ? allProducts.filter((p) => p.category === activeCategory)
    : allProducts;

  const visibleProducts = filteredProducts.slice(0, visibleCount);

  const toggleMobileFilter = () => setMobileFilterOpen(!mobileFilterOpen);

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-white font-sans">
      <Navbar />

      {/* Hero Section */}
      <section
        className="relative bg-cover bg-center text-white py-24 px-6"
        style={{ backgroundImage: "url('/images/hero-bg.jpg')" }}
      >
        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            SMART. FAST. AFFORDABLE
          </h1>
          <p className="text-lg sm:text-xl max-w-2xl mx-auto">
            Connecting African Business to Global Sellers.
          </p>
          <div className="mt-6">
            <a
              href="#products"
              className="inline-block bg-[#b76e2b] text-white px-6 py-3 rounded-lg shadow hover:bg-[#a56122] transition"
            >
              Explore Products
            </a>
          </div>
        </div>
      </section>

      {/* Mobile Filter Button */}
      <div className="md:hidden px-4 mt-8 flex justify-between items-center">
        <h2 className="text-lg font-semibold">Products</h2>
        <button onClick={toggleMobileFilter} className="text-sm text-[#b76e2b] border border-[#b76e2b] px-3 py-1 rounded flex items-center gap-1">
          {mobileFilterOpen ? <X size={16} /> : <Menu size={16} />}
          Filters
        </button>
      </div>

      {/* Main Grid Layout */}
      <div className="flex flex-col md:flex-row max-w-7xl mx-auto px-4 gap-6 mt-6">
        {/* Sidebar */}
        <aside
          className={`md:w-1/4 w-full bg-gray-100 p-4 rounded-lg shadow-sm md:block ${
            mobileFilterOpen ? "block" : "hidden"
          }`}
        >
          <h2 className="text-lg font-semibold mb-4 text-center">Categories</h2>
          <div className="space-y-4">
            {/* All Categories */}
            <button
              onClick={() => setActiveCategory(null)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition ${
                activeCategory === null
                  ? "bg-[#b76e2b] text-white"
                  : "bg-white text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Image src="/icons/all.png" alt="All Categories" width={24} height={24} />
              <span className="text-sm">All Categories</span>
            </button>

            {/* Dynamic Categories */}
            {categories.map((cat) => (
              <button
                key={cat.label}
                onClick={() =>
                  setActiveCategory(activeCategory === cat.label ? null : cat.label)
                }
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition ${
                  activeCategory === cat.label
                    ? "bg-[#b76e2b] text-white"
                    : "bg-white text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Image src={cat.icon} alt={cat.label} width={24} height={24} />
                <span className="text-sm">{cat.label}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Right Content */}
        <main className="md:w-3/4 w-full">
          {/* Featured Products */}
          <section id="products" className="py-8">
            <h2 className="text-xl font-semibold mb-6 text-center">Featured Products</h2>
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
              {visibleProducts.map((product, index) => (
                <FeaturedProductCard
                  key={index}
                  image={product.image}
                  title={product.title}
                  price={product.price}
                />
              ))}
            </div>

            {/* Load More */}
            {visibleCount < filteredProducts.length && (
              <div className="text-center mt-8">
                <button
                  onClick={() => setVisibleCount((prev) => prev + 3)}
                  className="px-6 py-3 bg-[#b76e2b] text-white rounded-lg shadow hover:bg-[#a56122] transition"
                >
                  Load More
                </button>
              </div>
            )}
          </section>

          {/* Features Section */}
          <section className="py-12" id="features">
            <div className="text-center">
              <h2 className="text-3xl font-semibold mb-6">Why Choose Us?</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-2">Verified Suppliers</h3>
                  <p>All sellers go through a strict verification process to ensure trust and quality.</p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Real-Time Communication</h3>
                  <p>Message suppliers instantly and get updates about your orders or inquiries.</p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Secure Transactions</h3>
                  <p>All transactions are monitored to ensure your payments and shipments are safe.</p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="py-16 px-6 bg-blue-700 text-white text-center rounded-lg shadow-sm mt-12">
            <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-lg mb-6">Join hundreds of businesses already using our platform.</p>
            <a
              href="#contact"
              className="inline-block bg-white text-blue-700 font-medium px-6 py-3 rounded-lg hover:bg-gray-100 transition"
            >
              Contact Us
            </a>
          </section>
        </main>
      </div>

      {/* Footer */}
      <footer className="py-8 px-6 bg-gray-100 dark:bg-gray-800 text-center mt-16">
        <p className="text-sm">© {new Date().getFullYear()} B2B Marketplace. All rights reserved.</p>
      </footer>
    </div>
  );
}
