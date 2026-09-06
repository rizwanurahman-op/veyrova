"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cloudinaryImg } from "@/lib/utils";

interface ProductImage {
  id: string;
  url: string;
  altText: string | null;
  isPrimary: boolean;
}

interface ProductImageGalleryProps {
  images: ProductImage[];
  productName: string;
  discount: number;
  isNewArrival: boolean;
}

export default function ProductImageGallery({
  images,
  productName,
  discount,
  isNewArrival,
}: ProductImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex] || images[0];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-cream border border-gold/10 shadow-xs group">
        {/* Badges */}
        {discount > 0 && (
          <span className="badge-discount text-xs sm:text-sm z-10">{discount}% OFF</span>
        )}
        {isNewArrival && (
          <span className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 badge-new text-xs z-10">
            New Arrival
          </span>
        )}

        {activeImage ? (
          <Image
            key={activeImage.url}
            src={cloudinaryImg(activeImage.url, { w: 1200, h: 1200, quality: "best" })}
            alt={activeImage.altText || productName}
            fill
            className="object-cover transition-opacity duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
            priority
            loading="eager"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-light">
            No Image
          </div>
        )}

        {/* Previous / Next Arrows (when multiple images) */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 backdrop-blur-xs shadow-md border border-black/5 flex items-center justify-center text-charcoal hover:text-black hover:bg-white transition-all active:scale-95 z-10"
              aria-label="Previous image"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 backdrop-blur-xs shadow-md border border-black/5 flex items-center justify-center text-charcoal hover:text-black hover:bg-white transition-all active:scale-95 z-10"
              aria-label="Next image"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails — flex scrollable */}
      {images.length > 1 && (
        <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto no-scrollbar py-1">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={`relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all focus:outline-none ${
                activeIndex === i
                  ? "border-gold shadow-sm shadow-gold/20 scale-[1.02]"
                  : "border-gold/15 hover:border-gold/40 opacity-70 hover:opacity-100"
              }`}
              aria-label={`View image ${i + 1}`}
            >
              <Image
                src={cloudinaryImg(img.url, { w: 150, h: 150 })}
                alt={img.altText || productName}
                fill
                className="object-cover"
                sizes="80px"
              />
              {/* Active overlay */}
              {activeIndex === i && (
                <div className="absolute inset-0 bg-gold/10 pointer-events-none" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Image counter for mobile */}
      {images.length > 1 && (
        <p className="text-center text-[0.7rem] sm:text-xs text-gray-400">
          {activeIndex + 1} of {images.length}
        </p>
      )}
    </div>
  );
}
