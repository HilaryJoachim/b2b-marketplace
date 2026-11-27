"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CloudUpload, Image as ImageIcon, FileText, FileSpreadsheet, 
  FileArchive, File, MoreVertical, Info, ChevronDown, Loader2
} from 'lucide-react';
import { useSupplierAuth } from '@/context/SupplierAuthContext';
import { supabase } from '@/utils/supabase/client';

// Mock Data
const FILTERS = [
  { id: 'all', label: 'All Files', count: 111, icon: null },
  { id: 'photos', label: 'Photos', count: 92, icon: ImageIcon },
  { id: 'pdfs', label: 'PDFs', count: 19, icon: FileText },
  { id: 'excel', label: 'Excel Sheets', count: 0, icon: FileSpreadsheet },
  { id: 'word', label: 'Word Docs', count: 0, icon: FileText },
  { id: 'zip', label: 'Zip Files', count: 0, icon: FileArchive },
  { id: 'other', label: 'Other Files', count: 0, icon: File },
];

const MOCK_FILES = [
  {
    id: 1,
    name: 'ecosure-fully-automatic-machine-model-1',
    resolution: '1191x1834',
    type: 'pdf',
    date: '21-02-2026',
    status: 'PDF saved as product',
    thumbnail: null // null implies use icon based on type
  },
  {
    id: 2,
    name: 'ecosure-fully-automatic-industrial',
    resolution: '1191x1834',
    type: 'photo',
    date: '21-02-2026',
    status: 'Photo saved as product',
    thumbnail: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500&q=80' // Placeholder industrial image
  },
  {
    id: 3,
    name: 'ecosure-fully-automatic-industrial-specs',
    resolution: '1191x1834',
    type: 'photo',
    date: '21-02-2026',
    status: 'Photo saved as product',
    thumbnail: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=500&q=80' // Placeholder spec sheet image
  },
  {
    id: 4,
    name: 'ecosure-fully-automatic-industrial-manual',
    resolution: '1191x1834',
    type: 'photo',
    date: '21-02-2026',
    status: 'Photo saved as product',
    thumbnail: 'https://images.unsplash.com/photo-1581092335397-9583eb92d232?w=500&q=80'
  },
  {
    id: 5,
    name: 'ecosure-factory-floor-layout',
    resolution: '1191x1834',
    type: 'photo',
    date: '21-02-2026',
    status: 'Photo saved as product',
    thumbnail: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=500&q=80'
  },
  {
    id: 6,
    name: 'ecosure-product-brochure-v2',
    resolution: '1191x1834',
    type: 'pdf',
    date: '21-02-2026',
    status: 'PDF saved as product',
    thumbnail: null
  },
  {
    id: 7,
    name: 'ecosure-technical-diagram-front',
    resolution: '1191x1834',
    type: 'photo',
    date: '21-02-2026',
    status: 'Photo saved as product',
    thumbnail: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=500&q=80'
  },
  {
    id: 8,
    name: 'ecosure-technical-diagram-side',
    resolution: '1191x1834',
    type: 'photo',
    date: '21-02-2026',
    status: 'Photo saved as product',
    thumbnail: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=500&q=80'
  }
];

export default function SupplierPhotosDocsPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/supplier/dashboard/products');
  }, [router]);

  const [activeFilter, setActiveFilter] = useState('all');
  const { supplierUser } = useSupplierAuth();
  
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (supplierUser) {
      if (supplierUser.id === 'sup_demo_001') {
        setLoading(false);
      } else {
        fetchMedia();
      }
    }
  }, [supplierUser]);

  const fetchMedia = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('supplier_media')
      .select('*')
      .eq('supplier_id', supplierUser!.id)
      .order('created_at', { ascending: false });
      
    if (data) {
      setFiles(data.map((f: any) => ({
        id: f.id,
        name: f.file_name,
        type: f.file_type,
        date: new Date(f.created_at).toLocaleDateString(),
        status: 'Uploaded',
        thumbnail: f.file_url,
        resolution: 'N/A'
      })));
    }
    setLoading(false);
  };

  const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
  const MAX_PDF_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !supplierUser || supplierUser.id === 'sup_demo_001') return;
    
    const file = e.target.files[0];
    const isPdf = file.name.toLowerCase().endsWith('.pdf');
    const maxSize = isPdf ? MAX_PDF_SIZE_BYTES : MAX_IMAGE_SIZE_BYTES;
    const maxLabel = isPdf ? '10 MB' : '5 MB';

    if (file.size > maxSize) {
      e.target.value = '';
      alert(`File "${file.name}" is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed size is ${maxLabel}. This file was not uploaded.`);
      return;
    }

    setIsUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${supplierUser.id}/${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage.from('supplier-media').upload(filePath, file);
      
      if (uploadError) {
        if (uploadError.message?.toLowerCase().includes('maximum allowed size') || (uploadError as any).statusCode === '413') {
          alert(`File "${file.name}" exceeds Supabase's storage size limit. Please upload a file under ${maxLabel}.`);
        } else {
          alert("Upload error: " + uploadError.message);
        }
      } else {
        const { data: { publicUrl } } = supabase.storage.from('supplier-media').getPublicUrl(filePath);
        
        await supabase.from('supplier_media').insert([{
          supplier_id: supplierUser.id,
          file_name: file.name,
          file_url: publicUrl,
          file_type: file.type.startsWith('image/') ? 'photo' : 'pdf',
        }]);
        
        await fetchMedia();
      }
    } catch (err: any) {
      console.error(err);
      alert("Upload failed: " + (err.message || 'Unknown error'));
    } finally {
      setIsUploading(false);
    }
  };

  const currentFilters = FILTERS.map(f => {
    if (f.id === 'all') return { ...f, count: files.length };
    if (f.id === 'photos') return { ...f, count: files.filter(file => file.type === 'photo').length };
    if (f.id === 'pdfs') return { ...f, count: files.filter(file => file.type === 'pdf').length };
    return { ...f, count: 0 };
  });

  const currentFiles = files.filter(f => activeFilter === 'all' || f.type === (activeFilter === 'photos' ? 'photo' : 'pdf'));

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto min-h-screen">
      
      {/* 1. Header & Upload */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-[#002d1b] mb-1">My Photos & Documents</h1>
          <p className="text-sm text-gray-500 font-medium">All your photos and documents at one place!</p>
        </div>
        
        <label className={`px-6 py-3 bg-[#11b899] text-white rounded-lg font-bold text-sm hover:bg-[#0da387] transition-colors shadow-sm flex items-center gap-2 border border-transparent whitespace-nowrap cursor-pointer ${isUploading ? 'opacity-50' : ''}`}>
          {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CloudUpload className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />}
          <span>{isUploading ? 'Uploading...' : 'Select or Drag & Drop files'}</span>
          <input type="file" className="hidden" onChange={handleUpload} accept="image/*,.pdf" disabled={isUploading} />
        </label>
      </div>

      {/* 2. Filter Toolbar */}
      <div className="mb-6 overflow-x-auto pb-2 hide-scrollbar">
        <div className="flex items-center gap-3">
          {currentFilters.map((filter) => {
            const Icon = filter.icon;
            const isActive = activeFilter === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm font-semibold whitespace-nowrap transition-all ${
                  isActive 
                    ? 'border-[#002d1b] text-[#002d1b] bg-green-50 shadow-sm' 
                    : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {Icon && <Icon className={`w-4 h-4 ${isActive ? 'text-[#002d1b]' : 'text-gray-400'}`} />}
                <span>{filter.label}</span>
                <span className={`text-xs ${isActive ? 'text-[#f36a1b]' : 'text-gray-400'}`}>
                  ({filter.count})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Sub-header (Count & Sort) */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6">
        <h2 className="text-lg font-bold text-[#002d1b]">
          {currentFilters.find(f => f.id === activeFilter)?.label} ({currentFilters.find(f => f.id === activeFilter)?.count})
        </h2>
        <div className="flex items-center gap-2 text-sm text-gray-600 font-medium cursor-pointer hover:text-gray-900">
          <span>Sort by:</span>
          <span className="text-gray-900">Recent added</span>
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>

      {/* 4. File Grid or Empty State */}
      {loading ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
          <Loader2 className="w-10 h-10 text-[#11b899] animate-spin mb-4" />
          <p className="text-gray-500">Loading your library...</p>
        </div>
      ) : currentFiles.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
          <div className="w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center mb-6">
            <CloudUpload className="w-12 h-12 text-[#11b899]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Files Uploaded Yet</h2>
          <p className="text-gray-500 mb-8 max-w-md">Your library is empty. Upload product images, PDF brochures, or specifications to get started.</p>
          <label className="cursor-pointer px-6 py-3 bg-[#11b899] text-white rounded-lg font-bold text-sm hover:bg-[#0da387] transition-colors shadow-sm shadow-[#11b899]/20 flex items-center gap-2 border border-transparent">
            <CloudUpload className="w-5 h-5" />
            <span>Upload Your First File</span>
            <input type="file" className="hidden" onChange={handleUpload} accept="image/*,.pdf" />
          </label>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {currentFiles.map((file) => (
            <div key={file.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md hover:border-[#f36a1b]/30 transition-all flex flex-col group">
              
              {/* Card Header (File Info) */}
              <div className="p-3 border-b border-gray-100 flex items-start justify-between gap-2 bg-gray-50/50">
                <div className="flex items-start gap-1.5 overflow-hidden">
                  {file.type === 'pdf' ? (
                    <FileText className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  ) : (
                    <ImageIcon className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  )}
                  <div className="truncate text-xs font-semibold text-gray-700">
                    <span className="truncate block" title={file.name}>{file.name}</span>
                    <span className="text-[10px] text-gray-400 font-normal">({file.resolution})</span>
                  </div>
                </div>
                <button className="p-1 text-gray-400 hover:text-[#002d1b] hover:bg-gray-100 rounded transition-colors shrink-0">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
  
              {/* Card Preview Area */}
              <div className="h-48 bg-gray-50 flex items-center justify-center p-4 relative">
                {file.type === 'pdf' ? (
                  <div className="text-center flex flex-col items-center justify-center h-full">
                    <div className="w-20 h-24 border-2 border-red-300 rounded-lg flex items-center justify-center bg-red-50 relative group-hover:scale-105 transition-transform">
                      <span className="font-black text-red-400 text-xl tracking-wider">PDF</span>
                      {/* Folded corner effect */}
                      <div className="absolute top-[-2px] right-[-2px] border-b-8 border-l-8 border-r-8 border-t-8 border-b-red-300 border-l-red-300 border-r-white border-t-white bg-white"></div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full relative group-hover:scale-105 transition-transform duration-300">
                    <img 
                      src={file.thumbnail!} 
                      alt={file.name} 
                      className="w-full h-full object-contain mix-blend-multiply" 
                    />
                  </div>
                )}
              </div>
  
              {/* Card Footer (Metadata) */}
              <div className="p-3 border-t border-gray-100 bg-white flex items-center justify-between mt-auto">
                <span className="text-[10px] text-gray-500 font-medium">
                  Uploaded: {file.date}
                </span>
                <div className="flex items-center gap-1 text-[10px] font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded">
                  {file.status}
                  <Info className="w-3 h-3 text-gray-400" />
                </div>
              </div>
  
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
