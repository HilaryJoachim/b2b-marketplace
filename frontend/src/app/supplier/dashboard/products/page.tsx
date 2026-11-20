"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, Filter, Plus, Box, AlertCircle, TrendingUp,
  Image as ImageIcon, Edit2, Share2, Eye, Trash2, ChevronDown, CheckCircle2, X, Save, Package, Loader2, Camera, Video, FileText
} from 'lucide-react';
import { useSupplierAuth } from '@/context/SupplierAuthContext';
import { supabase } from '@/utils/supabase/client';

const MOCK_PRODUCTS = [
  {
    id: 1,
    title: 'Ecosure Intelligent Fiber Stock Preparation System',
    category: 'Pulp Moulding Machinery',
    status: 'Active',
    score: 80,
    price: null,
    specsMissing: 2,
    image: null,
  },
  {
    id: 2,
    title: 'ECOSURE FULLY AUTOMATIC MACHINE (Model No. ECOFA12085-60T)',
    category: 'Pulp Moulding Machinery',
    status: 'Active',
    score: 70,
    price: null,
    specsMissing: 5,
    image: null,
  },
  {
    id: 3,
    title: 'Semi-Automatic Paper Egg Tray Machine',
    category: 'Packaging Machinery',
    status: 'Active',
    score: 95,
    price: '$25,000 / Set',
    specsMissing: 0,
    image: null,
  },
  {
    id: 4,
    title: 'Industrial Heavy Duty Mixer 500L',
    category: 'Mixing Equipment',
    status: 'Inactive',
    score: 45,
    price: null,
    specsMissing: 8,
    image: null,
  }
];

export default function SupplierProductsPage() {
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const { supplierUser } = useSupplierAuth();
  
  // Modal state
  const [activeModal, setActiveModal] = useState<'none' | 'viewImage' | 'editProduct'>('none');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showEditSpecs, setShowEditSpecs] = useState(false);
  
  // Edit Modal Media State
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [editExtraImages, setEditExtraImages] = useState<(File | null)[]>([null, null, null]);
  const [editExtraPreviews, setEditExtraPreviews] = useState<(string | null)[]>([null, null, null]);
  const [editPdfFile, setEditPdfFile] = useState<File | null>(null);
  const [editYoutubeUrl, setEditYoutubeUrl] = useState('');

  useEffect(() => {
    if (activeModal === 'editProduct' && selectedProduct) {
      setEditImagePreview(selectedProduct.image || null);
      setEditImageFile(null);
      setEditExtraImages([null, null, null]);
      setEditExtraPreviews([
        selectedProduct.extraImages?.[0] || null,
        selectedProduct.extraImages?.[1] || null,
        selectedProduct.extraImages?.[2] || null,
      ]);
      setEditPdfFile(null);
      setEditYoutubeUrl(selectedProduct.youtubeUrl || '');
    }
  }, [activeModal, selectedProduct]);
  
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (supplierUser) {
      if (supplierUser.id === 'sup_demo_001') {
        setProducts(MOCK_PRODUCTS);
        setIsLoading(false);
      } else {
        fetchProducts();
      }
    }
  }, [supplierUser]);

  const fetchProducts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('supplier_id', supplierUser!.id)
      .order('created_at', { ascending: false });
    
    if (data) {
      const mappedProducts = data.map((p: any) => ({
        id: p.id,
        title: p.title,
        category: p.category,
        status: p.status,
        score: p.score || 0,
        price: p.price,
        specsMissing: p.specs_missing || 0,
        image: p.image_url,
        extraImages: p.extra_images || [],
        youtubeUrl: p.youtube_url || '',
        pdfUrl: p.pdf_url || null,
      }));
      setProducts(mappedProducts);
    }
    setIsLoading(false);
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedProduct || !supplierUser || supplierUser.id === 'sup_demo_001') {
      alert("Cannot save products in demo mode.");
      setActiveModal('none');
      setShowEditSpecs(false);
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData(e.currentTarget);
      const title = formData.get('title') as string;
      const category = formData.get('category') as string;
      const status = formData.get('status') as string;
      const price = formData.get('price') as string;

      let imageUrl = selectedProduct.image; // Keep existing by default

      // Upload new image if provided
      if (editImageFile) {
        const fileExt = editImageFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
        const filePath = `${supplierUser.id}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage.from('supplier-media').upload(filePath, editImageFile);
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage.from('supplier-media').getPublicUrl(filePath);
        imageUrl = publicUrl;
      }

      // Handle extra images
      let extraImagesUrls = [...(selectedProduct.extraImages || [])];
      for (let i = 0; i < 3; i++) {
        if (editExtraImages[i]) {
          const file = editExtraImages[i]!;
          const fileExt = file.name.split('.').pop();
          const filePath = `${supplierUser.id}/extra/${Date.now()}-${Math.random()}.${fileExt}`;
          const { error } = await supabase.storage.from('supplier-media').upload(filePath, file);
          if (!error) {
            const { data: { publicUrl } } = supabase.storage.from('supplier-media').getPublicUrl(filePath);
            extraImagesUrls[i] = publicUrl;
          }
        }
      }
      extraImagesUrls = extraImagesUrls.filter(Boolean);

      // Handle PDF
      let pdfUrl = selectedProduct.pdfUrl || null;
      if (editPdfFile) {
        const fileExt = editPdfFile.name.split('.').pop();
        const filePath = `${supplierUser.id}/pdfs/${Date.now()}-${Math.random()}.${fileExt}`;
        const { error } = await supabase.storage.from('supplier-media').upload(filePath, editPdfFile);
        if (!error) {
          const { data: { publicUrl } } = supabase.storage.from('supplier-media').getPublicUrl(filePath);
          pdfUrl = publicUrl;
        }
      }

      // Update product in DB
      const { error: updateError } = await supabase
        .from('products')
        .update({
          title,
          category,
          status,
          price,
          image_url: imageUrl,
          extra_images: extraImagesUrls.length > 0 ? extraImagesUrls : null,
          youtube_url: editYoutubeUrl || null,
          pdf_url: pdfUrl,
        })
        .eq('id', selectedProduct.id)
        .eq('supplier_id', supplierUser.id);

      if (updateError) throw updateError;

      // Refresh products list
      await fetchProducts();
      
      // Close modal
      setActiveModal('none');
      setShowEditSpecs(false);
    } catch (error: any) {
      alert("Failed to update product: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredProducts = products.filter(p => {
    if (activeTab !== 'All' && p.status !== activeTab) return false;
    if (searchQuery && !p.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto min-h-screen relative">
      
      {/* 1. Header & Quick Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#002d1b] mb-4">Products</h1>
          <div className="flex gap-4 sm:gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <Box className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Products</p>
                <p className="text-xl font-bold text-gray-900">{products.length}</p>
              </div>
            </div>
            
            <div className="w-px bg-gray-200"></div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Active</p>
                <p className="text-xl font-bold text-gray-900">{products.filter(p => p.status === 'Active').length}</p>
              </div>
            </div>

            <div className="w-px bg-gray-200"></div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-[#f36a1b]">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Action Required</p>
                <p className="text-xl font-bold text-gray-900">{products.filter(p => p.specsMissing > 0).length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2">
            Quick Add
          </button>
          <Link 
            href="/supplier/dashboard/add-product"
            className="px-4 py-2.5 bg-[#f36a1b] text-white rounded-lg font-bold text-sm hover:bg-[#d95a12] transition-colors shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Product
          </Link>
        </div>
      </div>

      {/* 2. Smart Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-center z-20 relative">
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          {['All', 'Active', 'Inactive', 'Drafts'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors shrink-0 ${
                activeTab === tab 
                  ? 'bg-gray-100 text-gray-900' 
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#f36a1b] focus:border-[#f36a1b] transition-colors"
            />
          </div>
          <button className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm font-semibold">
            <Filter className="w-4 h-4" /> <span className="hidden sm:inline">Filters</span>
          </button>
        </div>
      </div>

      {/* 3. Modern Card Grid or Empty State */}
      {isLoading ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
          <Loader2 className="w-10 h-10 text-[#f36a1b] animate-spin mb-4" />
          <p className="text-gray-500">Loading your products...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
          <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mb-6">
            <Package className="w-12 h-12 text-[#f36a1b]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Products Yet</h2>
          <p className="text-gray-500 mb-8 max-w-md">You haven't added any products to your catalog. Start listing products to get discovered by global buyers.</p>
          <Link 
            href="/supplier/dashboard/add-product"
            className="px-6 py-3 bg-[#f36a1b] text-white rounded-lg font-bold hover:bg-[#d95a12] transition-colors flex items-center gap-2 shadow-sm shadow-[#f36a1b]/20"
          >
            <Plus className="w-5 h-5" /> Add Your First Product
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow flex flex-col relative group">
              
              {/* Status Badge */}
              <div className="absolute top-3 left-3 z-10">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                  product.status === 'Active' 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : 'bg-gray-50 text-gray-600 border-gray-200'
                }`}>
                  {product.status}
                </span>
              </div>
  
              {/* Optimization Score */}
              <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full border border-gray-100 shadow-sm">
                <TrendingUp className={`w-3.5 h-3.5 ${product.score > 80 ? 'text-emerald-500' : 'text-orange-500'}`} />
                <span className="text-xs font-bold text-gray-700">{product.score}/100</span>
              </div>
  
              {/* Image Area */}
              <div 
                className="h-48 bg-gray-50 flex items-center justify-center border-b border-gray-100 relative group-hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => { setSelectedProduct(product); setActiveModal('viewImage'); }}
              >
                {product.image ? (
                  <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <ImageIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <span className="text-xs font-semibold text-gray-400">No Image Provided</span>
                  </div>
                )}
                
                {/* Quick Hover Actions on Image */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setSelectedProduct(product); setActiveModal('viewImage'); }}
                    className="p-2 bg-white rounded-full hover:bg-gray-100 text-gray-700 shadow-sm" 
                    title="Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setSelectedProduct(product); setShowEditSpecs(false); setActiveModal('editProduct'); }}
                    className="p-2 bg-white rounded-full hover:bg-gray-100 text-gray-700 shadow-sm" 
                    title="Edit Images"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
  
              {/* Core Info */}
              <div className="p-5 flex-1 flex flex-col">
                <p className="text-xs font-bold text-[#f36a1b] uppercase tracking-wide mb-1">{product.category}</p>
                <h3 className="font-bold text-gray-900 text-sm mb-3 line-clamp-2 leading-tight" title={product.title}>
                  {product.title}
                </h3>
                
                {/* Price Row */}
                <div className="mb-4">
                  {product.price ? (
                    <p className="font-bold text-emerald-700">{product.price}</p>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-100">No Price</span>
                      <button 
                        onClick={() => { setSelectedProduct(product); setShowEditSpecs(false); setActiveModal('editProduct'); }}
                        className="text-xs font-bold text-[#002d1b] hover:underline"
                      >
                        Add Price
                      </button>
                    </div>
                  )}
                </div>
  
                {/* Action Alerts */}
                <div className="mt-auto">
                  {product.specsMissing > 0 ? (
                    <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-amber-800">{product.specsMissing} Missing Specifications</p>
                        <p className="text-[10px] text-amber-600 mt-0.5 leading-tight">Adding these will boost your visibility.</p>
                        <button 
                          onClick={() => { setSelectedProduct(product); setShowEditSpecs(true); setActiveModal('editProduct'); }}
                          className="text-[10px] font-bold uppercase tracking-wide text-[#f36a1b] mt-2 hover:underline"
                        >
                          Complete Specs
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-emerald-800">Perfectly Optimized!</p>
                        <p className="text-[10px] text-emerald-600 mt-0.5 leading-tight">This product is highly visible to buyers.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
  
              {/* Card Footer Actions */}
              <div className="border-t border-gray-100 p-3 bg-gray-50 flex justify-between items-center">
                <div className="flex gap-1">
                  <button 
                    onClick={() => { setSelectedProduct(product); setShowEditSpecs(false); setActiveModal('editProduct'); }}
                    className="p-1.5 text-gray-500 hover:text-[#f36a1b] hover:bg-orange-50 rounded transition-colors" 
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Share">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
                <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
  
            </div>
          ))}
  
          {/* 'Add New' Placeholder Card */}
          <Link 
            href="/supplier/dashboard/add-product"
            className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl overflow-hidden hover:border-[#f36a1b] hover:bg-orange-50/30 transition-all flex flex-col items-center justify-center min-h-[380px] cursor-pointer group"
          >
            <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-gray-400 group-hover:text-[#f36a1b] group-hover:scale-110 transition-all mb-4">
              <Plus className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-700 group-hover:text-[#f36a1b]">Add New Product</h3>
            <p className="text-xs text-gray-500 mt-1">Boost your catalog</p>
          </Link>
        </div>
      )}

      {/* Modals Background Overlay */}
      {activeModal !== 'none' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          
          {/* VIEW IMAGE MODAL */}
          {activeModal === 'viewImage' && selectedProduct && (
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h2 className="text-lg font-bold text-[#002d1b] truncate pr-4">{selectedProduct.title}</h2>
                <button onClick={() => setActiveModal('none')} className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full shrink-0">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 bg-gray-100 flex items-center justify-center p-8 overflow-y-auto">
                {selectedProduct.image ? (
                  <img src={selectedProduct.image} alt={selectedProduct.title} className="max-w-full max-h-full object-contain rounded shadow-sm" />
                ) : (
                  <div className="text-center flex flex-col items-center justify-center h-64">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                      <ImageIcon className="w-10 h-10 text-gray-300" />
                    </div>
                    <p className="text-lg font-bold text-gray-700">No Image Uploaded</p>
                    <p className="text-sm text-gray-500 mt-1">This product currently does not have a display image.</p>
                    <button 
                      onClick={() => setActiveModal('editProduct')}
                      className="mt-6 px-4 py-2 bg-[#f36a1b] text-white rounded-lg text-sm font-semibold hover:bg-[#d95a12] transition-colors"
                    >
                      Upload Image Now
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* EDIT PRODUCT MODAL */}
          {activeModal === 'editProduct' && selectedProduct && (
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div>
                  <h2 className="text-xl font-bold text-[#002d1b]">Edit Product Details</h2>
                  <p className="text-sm text-gray-500 mt-1">Make changes to product visibility and information.</p>
                </div>
                <button onClick={() => setActiveModal('none')} className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1">
                <form id="edit-form" onSubmit={handleEditSubmit} className="space-y-6">
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-4">
                      <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-gray-700">Product Title</label>
                        <input 
                          type="text" 
                          name="title"
                          defaultValue={selectedProduct.title}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#f36a1b]/20 focus:border-[#f36a1b] focus:bg-white transition-all"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="block text-sm font-semibold text-gray-700">Category</label>
                          <div className="relative">
                            <select name="category" defaultValue={selectedProduct.category} className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#f36a1b]/20 focus:border-[#f36a1b] focus:bg-white transition-all appearance-none">
                              <option value={selectedProduct.category}>{selectedProduct.category}</option>
                              <option>Packaging Machinery</option>
                              <option>Mixing Equipment</option>
                              <option>Other Machinery</option>
                            </select>
                            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-sm font-semibold text-gray-700">Status</label>
                          <div className="relative">
                            <select name="status" defaultValue={selectedProduct.status} className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#f36a1b]/20 focus:border-[#f36a1b] focus:bg-white transition-all appearance-none">
                              <option value="Active">Active</option>
                              <option value="Inactive">Inactive</option>
                              <option value="Draft">Draft</option>
                            </select>
                            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-gray-700">Price</label>
                        <input 
                          type="text" 
                          name="price"
                          placeholder="e.g. $25,000 / Set"
                          defaultValue={selectedProduct.price || ''}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#f36a1b]/20 focus:border-[#f36a1b] focus:bg-white transition-all"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-gray-700">Product Images</label>
                      <label className="block border-2 border-dashed border-gray-200 rounded-xl h-[160px] flex flex-col items-center justify-center text-center p-4 hover:border-[#f36a1b] hover:bg-orange-50/50 transition-colors cursor-pointer group relative overflow-hidden">
                        {editImagePreview ? (
                          <img src={editImagePreview} alt="Main Image" className="w-full h-full object-contain" />
                        ) : (
                          <>
                            <div className="w-12 h-12 bg-orange-50 text-[#f36a1b] rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                              <ImageIcon className="w-6 h-6" />
                            </div>
                            <p className="text-sm font-semibold text-gray-700">Upload main image</p>
                            <p className="text-xs text-gray-400 mt-1">Drag & drop or click</p>
                          </>
                        )}
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const file = e.target.files[0];
                              setEditImageFile(file);
                              setEditImagePreview(URL.createObjectURL(file));
                            }
                          }}
                        />
                      </label>
                      
                      {/* Extra empty image slots */}
                      <div className="grid grid-cols-3 gap-3">
                        {[0, 1, 2].map(index => (
                          <label key={index} className="aspect-square border border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-300 hover:border-[#f36a1b] hover:text-[#f36a1b] hover:bg-orange-50/50 transition-all cursor-pointer relative overflow-hidden group">
                            {editExtraPreviews[index] ? (
                              <img src={editExtraPreviews[index] as string} alt={`Extra ${index}`} className="w-full h-full object-cover" />
                            ) : (
                              <Camera className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            )}
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  const file = e.target.files[0];
                                  const newImages = [...editExtraImages];
                                  newImages[index] = file;
                                  setEditExtraImages(newImages);
                                  
                                  const newPreviews = [...editExtraPreviews];
                                  newPreviews[index] = URL.createObjectURL(file);
                                  setEditExtraPreviews(newPreviews);
                                }
                              }}
                            />
                          </label>
                        ))}
                      </div>

                      {/* Video and PDF slots */}
                      <div className="grid grid-cols-2 gap-3 mt-2">
                        <button 
                          type="button"
                          onClick={() => {
                            const url = prompt("Enter YouTube Video URL:");
                            if (url) setEditYoutubeUrl(url);
                          }}
                          className={`border border-dashed ${editYoutubeUrl ? 'border-blue-500 text-blue-600 bg-blue-50' : 'border-gray-200 text-gray-400 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50'} rounded-lg p-3 flex flex-col items-center justify-center transition-all cursor-pointer text-center`}
                        >
                          <Video className="w-5 h-5 mb-1" />
                          <span className="text-[10px] font-medium uppercase tracking-wide truncate w-full px-1">
                            {editYoutubeUrl ? "Video Added" : "Add Video"}
                          </span>
                        </button>
                        <label className={`block border border-dashed ${editPdfFile ? 'border-red-500 text-red-600 bg-red-50' : 'border-gray-200 text-gray-400 hover:border-red-500 hover:text-red-500 hover:bg-red-50'} rounded-lg p-3 flex flex-col items-center justify-center transition-all cursor-pointer text-center`}>
                          <FileText className="w-5 h-5 mb-1" />
                          <span className="text-[10px] font-medium uppercase tracking-wide truncate w-full px-1">
                            {editPdfFile ? editPdfFile.name : "Add PDF"}
                          </span>
                          <input 
                            type="file" 
                            className="hidden" 
                            accept=".pdf"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                setEditPdfFile(e.target.files[0]);
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Optimization Warnings inside Edit form */}
                  {selectedProduct.specsMissing > 0 && (
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mt-6">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                        <h4 className="font-bold text-amber-900">Missing Specifications</h4>
                      </div>
                      <p className="text-sm text-amber-700 mb-3">You are missing {selectedProduct.specsMissing} recommended specifications. Completing these will boost search ranking.</p>
                      
                      {!showEditSpecs ? (
                        <button 
                          type="button" 
                          onClick={() => setShowEditSpecs(true)}
                          className="text-sm font-bold text-[#f36a1b] bg-white px-4 py-2 rounded-lg border border-amber-200 shadow-sm hover:shadow-md transition-all"
                        >
                          Add Specifications Now
                        </button>
                      ) : (
                        <div className="mt-4 pt-4 border-t border-amber-200/50 space-y-4">
                          <h5 className="font-semibold text-amber-900 text-sm">Add New Specification</h5>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-amber-800 uppercase tracking-wide mb-1.5">Spec Name</label>
                              <input type="text" className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm bg-white focus:ring-1 focus:ring-amber-400 focus:outline-none" placeholder="e.g. Material" />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-amber-800 uppercase tracking-wide mb-1.5">Value</label>
                              <input type="text" className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm bg-white focus:ring-1 focus:ring-amber-400 focus:outline-none" placeholder="e.g. Stainless Steel" />
                            </div>
                          </div>
                          <button type="button" onClick={() => setShowEditSpecs(false)} className="text-xs font-bold text-amber-700 hover:text-amber-900 bg-amber-100/50 px-3 py-1.5 rounded-lg border border-amber-200">
                            Save Specification
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                </form>
              </div>

              <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
                <button type="button" onClick={() => setActiveModal('none')} className="px-6 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-200 bg-gray-100 rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit" form="edit-form" disabled={isSaving} className="px-6 py-2.5 text-sm font-semibold text-white bg-[#002d1b] hover:bg-[#001f12] rounded-lg transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
