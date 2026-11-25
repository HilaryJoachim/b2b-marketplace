"use client";

import { useState, useEffect } from "react";
import { 
  Camera, Video, FileText, Plus, CheckCircle2, Loader2, Trash2
} from "lucide-react";
import { useSupplierAuth } from "@/context/SupplierAuthContext";
import { supabase } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function ProductUploadForm() {
  const [activeTab, setActiveTab] = useState<'basic' | 'specs'>('basic');
  const [score, setScore] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);
  const [specifications, setSpecifications] = useState<{key: string, value: string}[]>([]);
  
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Construction Equipment');
  const [isSaving, setIsSaving] = useState(false);
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [extraImages, setExtraImages] = useState<(File | null)[]>([null, null, null]);
  const [extraPreviews, setExtraPreviews] = useState<(string | null)[]>([null, null, null]);
  
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  
  const { supplierUser } = useSupplierAuth();
  const router = useRouter();

  useEffect(() => {
    let newScore = 0;
    if (title.length > 3) newScore += 15;
    if (price && Number(price) > 0) newScore += 15;
    if (unit.trim()) newScore += 10;
    if (description.length > 10) newScore += 20;
    if (imageFile) newScore += 20;
    if (extraImages.some(img => img !== null)) newScore += 10;
    if (specifications.length > 0) newScore += 10;
    
    setScore(Math.min(100, newScore));
  }, [title, price, unit, description, imageFile, extraImages, specifications]);

  const handleSave = async () => {
    setFormError(null);
    
    if (!supplierUser || supplierUser.id === 'sup_demo_001') {
      alert("Cannot save products in demo mode.");
      return;
    }
    
    if (!title.trim() || !price.trim() || !category.trim()) {
      setFormError("Please fill in the Product Name, Category, and Price.");
      setActiveTab('basic');
      return;
    }
    
    if (!imageFile) {
      setFormError("Please upload a Main Photo.");
      setActiveTab('basic');
      return;
    }

    setIsSaving(true);
    let imageUrl = null;
    let extraImagesUrls: string[] = [];
    let pdfUrl = null;
    
    try {
      // Helper function to upload files
      const uploadFile = async (file: File, folder: string) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
        const filePath = `${supplierUser.id}/${folder}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage.from('supplier-media').upload(filePath, file);
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage.from('supplier-media').getPublicUrl(filePath);
        return publicUrl;
      };

      // 1. Upload main image
      imageUrl = await uploadFile(imageFile, 'main');

      // Upload extra images
      for (const file of extraImages) {
        if (file) {
          const url = await uploadFile(file, 'extra');
          extraImagesUrls.push(url);
        }
      }

      // Upload PDF
      if (pdfFile) {
        pdfUrl = await uploadFile(pdfFile, 'pdfs');
      }

      // 2. Generate Slug
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
      
      // Clean up empty specifications
      const cleanSpecs = specifications.filter(s => s.key.trim() && s.value.trim());

      // 3. Insert Product
      const { error } = await supabase.from('products').insert([
        {
          supplier_id: supplierUser.id,
          title,
          price,
          unit,
          description,
          category,
          slug,
          image_url: imageUrl,
          extra_images: extraImagesUrls.length > 0 ? extraImagesUrls : null,
          youtube_url: youtubeUrl || null,
          pdf_url: pdfUrl,
          specifications: cleanSpecs.length > 0 ? cleanSpecs : null,
          status: 'Active',
          specs_missing: Math.max(0, 5 - cleanSpecs.length),
          score: score,
        }
      ]);
      
      if (error) throw error;
      
      router.push('/supplier/dashboard/products');
    } catch (err: any) {
      setFormError("Error saving product: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      {/* 1. Left Column: Media Center */}
      <div className="lg:col-span-3 space-y-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm h-full">
          <h3 className="text-sm font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Product Media</h3>
          
          <div className="grid grid-cols-3 gap-3">
            {/* Main Photo */}
            <label className="col-span-3 aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-[#f36a1b] hover:bg-orange-50/50 hover:text-[#f36a1b] transition-all cursor-pointer group relative overflow-hidden">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <>
                  <Camera className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">Add Main Photo</span>
                </>
              )}
              <input 
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const file = e.target.files[0];
                    setImageFile(file);
                    setImagePreview(URL.createObjectURL(file));
                  }
                }}
              />
            </label>

            {/* Additional Media Slots */}
            {[0, 1, 2].map(index => (
              <label key={index} className="aspect-square border border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-300 hover:border-[#f36a1b] hover:text-[#f36a1b] hover:bg-orange-50/50 transition-all cursor-pointer relative overflow-hidden group">
                {extraPreviews[index] ? (
                  <img src={extraPreviews[index] as string} alt={`Extra ${index}`} className="w-full h-full object-cover" />
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
                      const newImages = [...extraImages];
                      newImages[index] = file;
                      setExtraImages(newImages);
                      
                      const newPreviews = [...extraPreviews];
                      newPreviews[index] = URL.createObjectURL(file);
                      setExtraPreviews(newPreviews);
                    }
                  }}
                />
              </label>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100">
            <button 
              type="button"
              onClick={() => {
                const url = prompt("Enter YouTube Video URL:");
                if (url) setYoutubeUrl(url);
              }}
              className={`border border-dashed ${youtubeUrl ? 'border-blue-500 text-blue-600 bg-blue-50' : 'border-gray-300 text-gray-400 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50'} rounded-lg p-3 flex flex-col items-center justify-center transition-all cursor-pointer text-center`}
            >
              <Video className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-medium uppercase tracking-wide truncate w-full px-1">
                {youtubeUrl ? "Video Added" : "Add Video"}
              </span>
            </button>
            <label className={`border border-dashed ${pdfFile ? 'border-red-500 text-red-600 bg-red-50' : 'border-gray-300 text-gray-400 hover:border-red-500 hover:text-red-500 hover:bg-red-50'} rounded-lg p-3 flex flex-col items-center justify-center transition-all cursor-pointer text-center`}>
              <FileText className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-medium uppercase tracking-wide truncate w-full px-1">
                {pdfFile ? pdfFile.name : "Add PDF"}
              </span>
              <input 
                type="file" 
                className="hidden" 
                accept=".pdf"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setPdfFile(e.target.files[0]);
                  }
                }}
              />
            </label>
          </div>
          
          <p className="text-[10px] text-gray-400 mt-4 text-center">
            Upload up to 4 photos. First photo is the main display.
          </p>
        </div>
      </div>

      {/* 2. Center Column: Main Form */}
      <div className="lg:col-span-6 flex flex-col">
        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-t-xl overflow-hidden border border-gray-200 border-b-0">
          <button 
            onClick={() => setActiveTab('basic')}
            className={`flex-1 py-3 text-sm font-bold transition-colors ${
              activeTab === 'basic' 
                ? 'bg-[#002d1b] text-white shadow-sm' 
                : 'text-gray-500 hover:bg-gray-200 hover:text-gray-700'
            }`}
          >
            Basic Details
          </button>
          <button 
            onClick={() => setActiveTab('specs')}
            className={`flex-1 py-3 text-sm font-bold transition-colors ${
              activeTab === 'specs' 
                ? 'bg-[#002d1b] text-white shadow-sm' 
                : 'text-gray-500 hover:bg-gray-200 hover:text-gray-700'
            }`}
          >
            Specification / Additional Details
          </button>
        </div>

        {/* Form Body */}
        <div className="bg-white border border-gray-200 rounded-b-xl p-6 shadow-sm flex-1">
          {activeTab === 'basic' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Product/Service Name</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter complete product name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f36a1b] focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Category</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#f36a1b] focus:border-transparent transition-all"
                >
                  <option value="Construction Equipment">Construction Equipment</option>
                  <option value="Agricultural Machinery">Agricultural Machinery</option>
                  <option value="Mining Equipment">Mining Equipment</option>
                  <option value="Packaging Machinery">Packaging Machinery</option>
                  <option value="Food Processing">Food Processing</option>
                  <option value="Manufacturing & Molding">Manufacturing & Molding</option>
                  <option value="Metalworking & Tools">Metalworking & Tools</option>
                  <option value="Material Handling">Material Handling</option>
                  <option value="Power & Generators">Power & Generators</option>
                  <option value="Industrial Parts">Industrial Parts</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1.5">Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">USD</span>
                    <input 
                      type="number" 
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f36a1b] focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1.5">Unit (Per)</label>
                  <input 
                    type="text" 
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="e.g. Piece, Set, Kg"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f36a1b] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-end mb-1.5">
                  <label className="block text-sm font-semibold text-gray-800">Product/Service Description</label>
                  <span className="text-xs text-gray-400">Uses, Details, Benefits, etc.</span>
                </div>
                
                <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#f36a1b] focus-within:border-transparent transition-all">
                  <textarea 
                    rows={8}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-4 focus:outline-none resize-y min-h-[150px] text-sm"
                    placeholder="Write a compelling description here..."
                  ></textarea>
                </div>
                <p className="text-xs text-gray-400 mt-2 text-right">{description.length} characters.</p>
              </div>

            </div>
          )}

          {activeTab === 'specs' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-blue-900 text-sm">Add Specifications</h4>
                <p className="text-xs text-blue-700 mt-1">Products with detailed specifications get 40% more inquiries from buyers.</p>
              </div>
              
              <div className="space-y-4">
                {specifications.map((spec, index) => (
                  <div key={index} className="flex gap-4 items-start">
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Feature / Key</label>
                      <input 
                        type="text" 
                        value={spec.key}
                        onChange={(e) => {
                          const newSpecs = [...specifications];
                          newSpecs[index].key = e.target.value;
                          setSpecifications(newSpecs);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" 
                        placeholder="e.g. Brand" 
                      />
                    </div>
                    <div className="flex-[2]">
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Value</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={spec.value}
                          onChange={(e) => {
                            const newSpecs = [...specifications];
                            newSpecs[index].value = e.target.value;
                            setSpecifications(newSpecs);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" 
                          placeholder="e.g. Sony" 
                        />
                        <button 
                          onClick={() => {
                            const newSpecs = specifications.filter((_, i) => i !== index);
                            setSpecifications(newSpecs);
                          }}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-200 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => setSpecifications([...specifications, {key: '', value: ''}])}
                className="w-full py-2 border-2 border-dashed border-gray-300 text-gray-500 rounded-lg text-sm font-bold hover:bg-gray-50 hover:text-gray-700 hover:border-gray-400 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Custom Specification
              </button>
            </div>
          )}

          {/* Action Footer */}
          <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-end gap-4">
            {formError && (
              <span className="text-red-500 font-semibold text-sm">{formError}</span>
            )}
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-bold text-sm hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Save and Continue &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* 3. Right Column: Product Score & Nav */}
      <div className="lg:col-span-3 space-y-6">
        
        {/* Product Score Widget */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Product Score:</h3>
          
          <div className="flex items-center justify-between mb-2">
            <div className="w-12 h-12 rounded-full border-4 border-orange-200 flex items-center justify-center relative">
              {/* Mock progress ring overlay */}
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle cx="24" cy="24" r="20" fill="transparent" stroke="#f36a1b" strokeWidth="4" strokeDasharray="125" strokeDashoffset={125 - (125 * score) / 100} strokeLinecap="round" className="transition-all duration-1000" />
              </svg>
              <span className="text-sm font-bold text-gray-800">{score}</span>
            </div>
            <span className="text-xs font-medium text-gray-400">100</span>
          </div>
          
          <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
            <div className="bg-[#f36a1b] h-full transition-all duration-1000" style={{ width: `${score}%` }}></div>
          </div>
          
          <p className="text-[10px] text-gray-500 mt-3 leading-tight">
            Higher score means better visibility in buyer searches. Complete all fields to reach 100.
          </p>
        </div>

        {/* Section Navigation */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div 
            onClick={() => setActiveTab('basic')}
            className={`p-4 border-b border-gray-100 flex items-center justify-between cursor-pointer transition-colors ${activeTab === 'basic' ? 'bg-orange-50/50' : 'hover:bg-gray-50'}`}
          >
            <span className={`text-sm font-semibold ${activeTab === 'basic' ? 'text-[#f36a1b]' : 'text-gray-700'}`}>Basic details</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div 
            onClick={() => setActiveTab('specs')}
            className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${activeTab === 'specs' ? 'bg-orange-50/50' : 'hover:bg-gray-50'}`}
          >
            <span className={`text-sm font-semibold ${activeTab === 'specs' ? 'text-[#f36a1b]' : 'text-gray-700'}`}>Specifications</span>
            <div className="w-2 h-2 rounded-full bg-gray-300"></div>
          </div>
        </div>

      </div>
      
    </div>
  );
}

function ToolbarButton({ icon }: { icon: React.ReactNode }) {
  return (
    <button className="p-1.5 text-gray-600 hover:bg-gray-200 hover:text-gray-900 rounded transition-colors focus:outline-none focus:ring-1 focus:ring-[#f36a1b]">
      {icon}
    </button>
  );
}
