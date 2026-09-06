import Link from "next/link";
import { MessageCircle, Mail, MapPin, Phone, Heart, ShieldCheck, Truck } from "lucide-react";
import { InstagramIcon } from "@/components/icons";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const rawWhatsApp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "917558002009";
  const instagramHandle = process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE || "veyrova.store_";

  // Formatted display: e.g. +91 75580 02009
  const formattedPhone = rawWhatsApp.length >= 10
    ? `+${rawWhatsApp.slice(0, 2)} ${rawWhatsApp.slice(2, 7)} ${rawWhatsApp.slice(7)}`
    : `+${rawWhatsApp}`;

  return (
    <footer
      className="relative bg-[#0b0b0c] text-cream-light border-t border-gold/15 overflow-hidden pt-8 sm:pt-14 lg:pt-[5.5rem]"
    >
      {/* Ambient luxury glow in corners */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gold/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Footer Container */}
      <div
        className="relative z-10 mx-auto px-6 sm:px-8 lg:px-12 pb-10 sm:pb-12 lg:pb-16"
        style={{
          maxWidth: "1380px",
        }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 xl:gap-16">
          {/* 1. Brand Column (4 cols) */}
          <div className="lg:col-span-4 flex flex-col justify-between">
            <div>
              <Link href="/" className="inline-block group mb-3">
                <span
                  className="text-2xl lg:text-3xl font-bold tracking-[0.2em] text-white group-hover:text-gold transition-colors duration-300"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  VEYROVA
                </span>
                <p className="text-[0.65rem] tracking-[0.25em] text-gold uppercase mt-1 font-medium">
                  All Products. All For You.
                </p>
              </Link>
              <p className="text-sm text-gray-light leading-relaxed mb-6 max-w-sm">
                Your premium destination for trending products. Best quality, unbeatable deals,
                and direct WhatsApp ordering with fast delivery.
              </p>
            </div>

            {/* Social Channels */}
            <div>
              <p className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-3">
                Connect With Us
              </p>
              <div className="flex items-center gap-3">
                <a
                  href={`https://wa.me/${rawWhatsApp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-[#25D366] hover:border-[#25D366] text-white hover:text-white transition-all duration-300 text-xs font-medium group"
                  aria-label="Chat on WhatsApp"
                >
                  <MessageCircle size={16} className="text-[#25D366] group-hover:text-white transition-colors" />
                  <span>WhatsApp</span>
                </a>
                <a
                  href={`https://instagram.com/${instagramHandle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-500 hover:border-transparent text-white transition-all duration-300 text-xs font-medium group"
                  aria-label="Follow on Instagram"
                >
                  <InstagramIcon size={16} className="text-pink-400 group-hover:text-white transition-colors" />
                  <span>Instagram</span>
                </a>
              </div>
            </div>
          </div>

          {/* 2. Quick Links (2 cols) */}
          <div className="lg:col-span-2">
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-3">
              Explore
            </h4>
            <div className="gold-divider mb-5" />
            <ul className="space-y-3">
              {[
                { label: "Home", href: "/" },
                { label: "All Products", href: "/products" },
                { label: "New Arrivals", href: "/products?filter=new" },
                { label: "Best Sellers", href: "/products?filter=bestseller" },
                { label: "Featured Deals", href: "/products?filter=featured" },
              ].map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-light hover:text-gold transition-all duration-200 inline-block hover:translate-x-1"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Customer Support (3 cols) */}
          <div className="lg:col-span-3">
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-3">
              Customer Care
            </h4>
            <div className="gold-divider mb-5" />
            <ul className="space-y-3">
              {[
                { label: "How to Order on WhatsApp", href: "/#how-to-order" },
                { label: "Shipping & Dispatch Policy", href: "/products" },
                { label: "Quality Guarantee", href: "/products" },
                { label: "Returns & Exchanges", href: `https://wa.me/${rawWhatsApp}?text=Hi%2C%20I%20have%20a%20question%20about%20returns` },
                { label: "Support & FAQs", href: `https://wa.me/${rawWhatsApp}?text=Hi%2C%20I%20need%20help%20with%20an%20order` },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-light hover:text-gold transition-all duration-200 inline-block hover:translate-x-1"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 4. Contact & Top Right (3 cols) */}
          <div className="lg:col-span-3">
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-3">
              Get in Touch
            </h4>
            <div className="gold-divider mb-5" />
            <div className="space-y-3">
              <a
                href={`https://wa.me/${rawWhatsApp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-2.5 -mx-2.5 rounded-xl text-sm text-gray-light hover:text-white hover:bg-white/5 transition-all duration-200 group"
              >
                <div className="w-8 h-8 rounded-lg bg-[#25D366]/10 flex items-center justify-center text-[#25D366] group-hover:bg-[#25D366] group-hover:text-white transition-colors shrink-0">
                  <Phone size={15} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-white/50 leading-none mb-1">WhatsApp Order Support</p>
                  <p className="font-semibold text-white truncate">{formattedPhone}</p>
                </div>
              </a>

              <a
                href={`https://instagram.com/${instagramHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-2.5 -mx-2.5 rounded-xl text-sm text-gray-light hover:text-white hover:bg-white/5 transition-all duration-200 group"
              >
                <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-400 group-hover:bg-gradient-to-br group-hover:from-purple-600 group-hover:to-pink-500 group-hover:text-white transition-colors shrink-0">
                  <InstagramIcon size={15} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-white/50 leading-none mb-1">Instagram Direct</p>
                  <p className="font-semibold text-white truncate">@{instagramHandle}</p>
                </div>
              </a>

              <a
                href="mailto:contact@veyrova.com"
                className="flex items-center gap-3 p-2.5 -mx-2.5 rounded-xl text-sm text-gray-light hover:text-white hover:bg-white/5 transition-all duration-200 group"
              >
                <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-black transition-colors shrink-0">
                  <Mail size={15} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-white/50 leading-none mb-1">Email Inquiries</p>
                  <p className="font-medium text-white/90 truncate">contact@veyrova.com</p>
                </div>
              </a>

              <div className="flex items-center gap-3 p-2.5 -mx-2.5 rounded-xl text-sm text-gray-light">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gold shrink-0">
                  <MapPin size={15} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-white/50 leading-none mb-1">Location</p>
                  <p className="font-medium text-white/90">Kerala, India</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar with Trust Badges */}
      <div className="relative z-10 border-t border-white/10 bg-black/50">
        <div
          className="mx-auto px-6 sm:px-8 lg:px-12 py-7 sm:py-8"
          style={{ maxWidth: "1380px" }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
            <p className="text-xs text-gray-light text-center md:text-left">
              © {currentYear} <span className="text-white font-medium tracking-wider">VEYROVA</span>. All rights reserved.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs text-white/70">
              <span className="flex items-center gap-2 font-medium">
                <Truck size={15} className="text-gold shrink-0" />
                <span>Fast Nationwide Delivery</span>
              </span>
              <span className="flex items-center gap-2 font-medium">
                <ShieldCheck size={15} className="text-gold shrink-0" />
                <span>100% Quality Assured</span>
              </span>
            </div>

            <p className="text-xs text-gray-light flex items-center justify-center md:justify-end gap-1.5 text-center">
              Made with <Heart size={13} className="text-gold fill-gold animate-pulse shrink-0" /> in India
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
