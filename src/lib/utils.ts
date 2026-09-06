import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Optimise a Cloudinary image URL with automatic format + quality + optional resize.
 *
 * - f_auto     → serves WebP to Chrome/Edge, AVIF to Safari (60-80% smaller than JPG/PNG)
 * - q_auto     → Cloudinary AI picks best quality/size balance
 * - dpr_auto   → serves 2× image to retina screens, 1× to standard (crucial for sharp look)
 * - w_N,h_N,c_fill,g_auto → resize + smart crop (AI keeps main subject centred)
 *
 * quality presets:
 *   "good"  (default) → balance between size and clarity, for cards/thumbnails
 *   "best"            → maximum sharpness, for hero/product detail images
 *
 * Non-Cloudinary URLs (e.g. local /images/...) are returned unchanged.
 */
export function cloudinaryImg(
  url: string | null | undefined,
  opts: { w?: number; h?: number; quality?: "good" | "best" } = {}
): string {
  if (!url) return "";

  // Only transform Cloudinary-hosted URLs
  if (!url.includes("res.cloudinary.com")) return url;

  const quality = opts.quality === "best" ? "q_auto:best" : "q_auto:good";

  // Build transformation string
  // dpr_auto → Cloudinary multiplies w/h by the device pixel ratio automatically
  const transforms = ["f_auto", quality, "dpr_auto"];
  if (opts.w && opts.h) {
    transforms.push(`w_${opts.w}`, `h_${opts.h}`, "c_fill", "g_auto");
  } else if (opts.w) {
    transforms.push(`w_${opts.w}`, "c_limit");
  } else if (opts.h) {
    transforms.push(`h_${opts.h}`, "c_limit");
  }
  const t = transforms.join(",");

  // Insert transformations after /upload/
  return url.replace("/upload/", `/upload/${t}/`);
}

/**
 * Format price in INR
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Calculate discount percentage
 */
export function getDiscountPercent(price: number, comparePrice: number): number {
  if (!comparePrice || comparePrice <= price) return 0;
  return Math.round(((comparePrice - price) / comparePrice) * 100);
}

/**
 * Generate slug from text
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Generate WhatsApp deep link with pre-filled message
 */
export function getWhatsAppLink(product: {
  name: string;
  sku?: string | null;
  price: number;
  quantity?: number;
}): string {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919876543210";
  const message = encodeURIComponent(
    `Hi, I want to order:\n\n` +
      `Product: ${product.name}\n` +
      `${product.sku ? `Product ID: ${product.sku}\n` : ""}` +
      `Quantity: ${product.quantity || 1}\n` +
      `Price: ${formatPrice(product.price)}\n\n` +
      `Please confirm availability and delivery details.`
  );
  return `https://wa.me/${phone}?text=${message}`;
}

/**
 * Generate Instagram profile link
 */
export function getInstagramLink(): string {
  const handle = process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE || "veyrova.store_";
  return `https://instagram.com/${handle}`;
}

/**
 * Truncate text to a specified length
 */
export function truncateText(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.substring(0, length).trim() + "...";
}

/**
 * Generate order number (VR-XXXX format)
 */
export function generateOrderNumber(sequence: number): string {
  return `VR-${String(sequence).padStart(4, "0")}`;
}
