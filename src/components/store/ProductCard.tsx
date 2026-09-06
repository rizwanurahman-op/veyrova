"use client";

import Link from "next/link";
import Image from "next/image";
import { MessageCircle } from "lucide-react";
import { InstagramIcon } from "@/components/icons";
import { formatPrice, getDiscountPercent, getWhatsAppLink, cloudinaryImg } from "@/lib/utils";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    comparePrice?: number | null;
    shortDescription?: string | null;
    sku?: string | null;
    isFeatured: boolean;
    isNewArrival: boolean;
    isBestSeller: boolean;
    images: {
      url: string;
      altText?: string | null;
      isPrimary: boolean;
    }[];
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];
  const discount = product.comparePrice
    ? getDiscountPercent(product.price, product.comparePrice)
    : 0;

  const instagramHandle = process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE || "veyrova.store_";

  return (
    <div className="product-card group" id={`product-card-${product.slug}`}>
      {/* Product Image & Badges */}
      <div className="product-card-image">
        {/* Badges — Sleek, compact luxury tags */}
        <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-10 flex flex-col gap-1 items-start pointer-events-none">
          {discount > 0 && (
            <span className="bg-[#E53935] text-white text-[0.62rem] sm:text-[0.68rem] font-bold px-2 py-0.5 rounded-md shadow-xs uppercase tracking-wider">
              {discount}% OFF
            </span>
          )}
          {product.isNewArrival && (
            <span className="bg-black/90 text-gold border border-gold/30 text-[0.62rem] sm:text-[0.68rem] font-bold px-2 py-0.5 rounded-md shadow-xs uppercase tracking-wider">
              New
            </span>
          )}
          {product.isBestSeller && (
            <span className="bg-gold-dark text-white text-[0.62rem] sm:text-[0.68rem] font-bold px-2 py-0.5 rounded-md shadow-xs uppercase tracking-wider">
              Bestseller
            </span>
          )}
        </div>

        {/* Quick Instagram DM Button on Image Top-Right */}
        <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-10">
          <a
            href={`https://instagram.com/${instagramHandle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 backdrop-blur-sm border border-black/5 flex items-center justify-center text-gray-700 hover:text-white hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-500 shadow-xs hover:scale-110 active:scale-95 transition-all duration-200"
            aria-label="DM on Instagram"
            onClick={(e) => e.stopPropagation()}
          >
            <InstagramIcon size={14} />
          </a>
        </div>

        {/* Image links to product page */}
        <Link href={`/products/${product.slug}`} className="relative block w-full h-full" tabIndex={-1}>
          {primaryImage ? (
            <Image
              src={cloudinaryImg(primaryImage.url, { w: 600, h: 600 })}
              alt={primaryImage.altText || product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              loading="eager"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-cream">
              <span className="text-gray-light text-xs">No Image</span>
            </div>
          )}
        </Link>
      </div>

      {/* Info Content */}
      <div className="flex-1 flex flex-col justify-between p-3 sm:p-4 md:p-5">
        {/* Top Content: Title & Short Description */}
        <div className="flex flex-col gap-1">
          <Link href={`/products/${product.slug}`}>
            <h3 className="text-xs sm:text-sm font-semibold text-black line-clamp-2 hover:text-gold-dark transition-colors leading-snug min-h-[2rem] sm:min-h-[2.5rem]">
              {product.name}
            </h3>
          </Link>

          {product.shortDescription && (
            <p className="text-[0.7rem] sm:text-xs text-gray line-clamp-1 leading-relaxed">
              {product.shortDescription}
            </p>
          )}
        </div>

        {/* Bottom Content: Price & Full-Width Buy Button */}
        <div className="mt-3 sm:mt-4 flex flex-col gap-2.5 sm:gap-3">
          {/* Price Row */}
          <div className="flex items-baseline flex-wrap gap-1.5 sm:gap-2">
            <span className="text-sm sm:text-base font-bold text-black">
              {formatPrice(product.price)}
            </span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-[0.7rem] sm:text-xs text-gray-light line-through">
                {formatPrice(product.comparePrice)}
              </span>
            )}
            {discount > 0 && (
              <span className="text-[0.65rem] sm:text-xs font-semibold text-emerald-600 ml-auto sm:ml-0">
                {discount}% off
              </span>
            )}
          </div>

          {/* Full-width High-converting WhatsApp Action Button */}
          <a
            href={getWhatsAppLink({
              name: product.name,
              sku: product.sku,
              price: product.price,
            })}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-2 sm:py-2.5 px-2 sm:px-3 rounded-xl text-[0.72rem] sm:text-xs md:text-sm font-semibold flex items-center justify-center gap-1 sm:gap-1.5 shadow-xs hover:shadow-md active:scale-[0.98] transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <MessageCircle size={14} fill="white" className="shrink-0" />
            <span className="truncate">Buy on WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
