"use client";

import Link from "next/link";
import Image from "next/image";
import { Plus, MoreHorizontal, CheckCircle2, Clock } from "lucide-react";

export default function SupplierProductsTab() {
  // Mock Data
  const mockProducts = [
    {
      id: "1",
      title: "Industrial Grade Excavator X200",
      image: "https://images.unsplash.com/photo-1579979730704-5f5d81c1955f?q=80&w=600&auto=format&fit=crop",
      price: 25000,
      moq: 1,
      status: "Active",
      views: 145,
    },
    {
      id: "2",
      title: "Heavy Duty Tractor Pro 4x4",
      image: "https://images.unsplash.com/photo-1592860882195-236b33454b8d?q=80&w=600&auto=format&fit=crop",
      price: 18500,
      moq: 2,
      status: "Active",
      views: 89,
    },
    {
      id: "3",
      title: "Commercial Grade Solar Panel Set",
      image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=600&auto=format&fit=crop",
      price: 1200,
      moq: 50,
      status: "Pending Review",
      views: 0,
    }
  ];

  return (
    <div className="space-y-6">
      {/* Tab Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Product Catalog</h2>
          <p className="text-sm text-gray-500">Manage your existing products or add new ones.</p>
        </div>
        <Link
          href="/supplier/dashboard/add-product"
          className="inline-flex items-center gap-2 bg-[#F36A1B] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#d95a12] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add New Product
        </Link>
      </div>

      {/* Product List */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
              <tr>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Price (USD)</th>
                <th className="px-6 py-4 font-medium">MOQ</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Views</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                        <Image
                          src={product.image}
                          alt={product.title}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="font-semibold text-gray-900 truncate max-w-[200px]">
                        {product.title}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-700">
                    ${product.price.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {product.moq} {product.moq === 1 ? 'unit' : 'units'}
                  </td>
                  <td className="px-6 py-4">
                    {product.status === "Active" ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700">
                        <Clock className="w-3.5 h-3.5" />
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {product.views}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
