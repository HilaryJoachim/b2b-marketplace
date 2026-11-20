"use client";

import Image from "next/image";
import { useState } from "react";

interface ProductImageGalleryProps {
  images: string[];
  title: string;
}

export default function ProductImageGallery({ images, title }: ProductImageGalleryProps) {
  const [activeImage, setActiveImage] = useState(images[0]);

  if (!images || images.length === 0) return null;

  return (
    <div>
      <div className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-center min-h-[400px]">
        <Image
          src={activeImage}
          alt={title}
          width={1200}
          height={900}
          quality={100}
          className="w-full max-h-[600px] object-contain transition-opacity duration-300"
        />
      </div>
      
      {images.length > 1 && (
        <div className="mt-4 flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
          {images.map((imgSrc, idx) => (
            <div 
              key={idx} 
              onClick={() => setActiveImage(imgSrc)}
              className={`w-20 h-20 shrink-0 bg-gray-50 dark:bg-gray-900 rounded-lg border-2 cursor-pointer overflow-hidden transition-all duration-200 ${
                activeImage === imgSrc 
                  ? 'border-[#f36a1b] shadow-md ring-2 ring-[#f36a1b]/20 scale-105' 
                  : 'border-transparent hover:border-gray-300 opacity-70 hover:opacity-100'
              }`}
            >
              <Image
                src={imgSrc}
                alt={`Thumbnail ${idx}`}
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
