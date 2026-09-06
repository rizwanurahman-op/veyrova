"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, MessageCircle, ShoppingBag } from "lucide-react";
import { cloudinaryImg } from "@/lib/utils";

export type HeroSlide = {
  id: string;
  title: string;
  subtitle: string;
  tagline: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  ctaSecondaryText?: string;
  ctaSecondaryLink?: string;
  imageUrl: string;
  imageAlt?: string;
  active: boolean;
  sortOrder: number;
};

// Fallback slides used when no slides are configured in DB
const FALLBACK_SLIDES: HeroSlide[] = [
  {
    id: "f1",
    title: "Exclusive Deals",
    subtitle: "Up to 60% Off",
    tagline: "Best Quality • Fast Delivery",
    description: "Discover amazing deals on phone cases, smart watches, earbuds, and much more. Premium quality guaranteed.",
    ctaText: "Shop Now",
    ctaLink: "/products?filter=featured",
    ctaSecondaryText: "Shop on WhatsApp",
    ctaSecondaryLink: "",
    imageUrl: "",
    imageAlt: "",
    active: true,
    sortOrder: 0,
  },
  {
    id: "f2",
    title: "New Arrivals",
    subtitle: "Just Dropped",
    tagline: "Fresh • Trendy • Premium",
    description: "Be the first to grab our latest collection. Trending products handpicked for you.",
    ctaText: "View New Arrivals",
    ctaLink: "/products?filter=new",
    ctaSecondaryText: "DM on Instagram",
    ctaSecondaryLink: "",
    imageUrl: "",
    imageAlt: "",
    active: true,
    sortOrder: 1,
  },
];

// Cubic-bezier typed as a 4-tuple — required by framer-motion's BezierDefinition
const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

const SLIDE_DURATION = 6000; // ms

// Stagger container for animated text
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
  exit: { transition: { staggerChildren: 0.04, staggerDirection: -1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 28, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.55, ease: EASE_OUT } },
  exit: { opacity: 0, y: -18, filter: "blur(4px)", transition: { duration: 0.3, ease: EASE_OUT } },
};

const imageVariants = {
  hidden: { opacity: 0, scale: 0.92, x: 40 },
  show: { opacity: 1, scale: 1, x: 0, transition: { duration: 0.7, ease: EASE_OUT } },
  exit: { opacity: 0, scale: 0.96, x: 30, transition: { duration: 0.4, ease: EASE_OUT } },
};

export default function HeroSection({ initialSlides }: { initialSlides?: HeroSlide[] }) {
  // Use server-provided slides immediately — no client fetch needed
  const resolvedSlides = (initialSlides && initialSlides.length > 0 ? initialSlides : FALLBACK_SLIDES)
    .filter((s) => s.active);

  const [slides] = useState<HeroSlide[]>(resolvedSlides);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const slideTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeSlides = slides;
  const totalSlides = activeSlides.length;

  // Progress bar + auto-advance
  const resetTimers = (index: number) => {
    if (progressRef.current) clearInterval(progressRef.current);
    if (slideTimerRef.current) clearInterval(slideTimerRef.current);

    setProgress(0);
    const tick = 50; // ms per tick
    const steps = SLIDE_DURATION / tick;
    let step = 0;

    progressRef.current = setInterval(() => {
      step++;
      setProgress((step / steps) * 100);
    }, tick);

    slideTimerRef.current = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, SLIDE_DURATION);
  };

  useEffect(() => {
    if (totalSlides <= 1) return;
    resetTimers(currentIndex);
    return () => {
      if (progressRef.current) clearInterval(progressRef.current);
      if (slideTimerRef.current) clearTimeout(slideTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, totalSlides]);

  const goToSlide = (i: number) => {
    setCurrentIndex(i);
  };

  if (activeSlides.length === 0) return null;
  const slide = activeSlides[currentIndex] || activeSlides[0];
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919876543210";

  return (
    <section
      className="relative overflow-hidden bg-[#FAF8F4]"
      style={{ minHeight: "92vh" }}
      id="hero-section"
    >
      {/* ── Decorative grid/grain texture ───────────────────────────────── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23C8A96E' fill-opacity='1'%3E%3Cpath d='M0 0h1v1H0zm20 0h1v1h-1zM0 20h1v1H0zm20 20h1v1h-1z'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* ── Soft gold orbs ──────────────────────────────────────────────── */}
      <div className="pointer-events-none absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-gold/6 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -left-20 w-[500px] h-[500px] rounded-full bg-gold/5 blur-[100px]" />

      {/* ── Main grid ───────────────────────────────────────────────────── */}
      <div className="container mx-auto px-6 lg:px-10 relative z-10 flex flex-col lg:flex-row items-center gap-0 lg:gap-12"
        style={{ minHeight: "92vh" }}>

        {/* LEFT — Text content */}
        <div className="flex-1 flex flex-col justify-center py-20 lg:py-0 lg:pr-6 max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="space-y-6"
            >
              {/* Tagline pill */}
              <motion.div variants={itemVariants}>
                <span className="inline-flex items-center gap-2 border border-gold/30 bg-gold/8 backdrop-blur-sm rounded-full px-4 py-1.5 text-xs font-semibold tracking-[0.18em] text-gold-dark uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                  {slide.tagline || "VEYROVA"}
                </span>
              </motion.div>

              {/* Title */}
              <div>
                <motion.h1
                  variants={itemVariants}
                  className="leading-[1.08] tracking-tight text-black"
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "clamp(2.8rem, 6vw, 5rem)",
                    fontWeight: 700,
                  }}
                >
                  {slide.title}
                </motion.h1>

                {/* Gold subtitle */}
                <motion.div variants={itemVariants} className="mt-1">
                  <span
                    className="gold-shimmer leading-tight block"
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: "clamp(2.2rem, 5vw, 4rem)",
                      fontWeight: 700,
                    }}
                  >
                    {slide.subtitle}
                  </span>
                </motion.div>
              </div>

              {/* Thin gold rule */}
              <motion.div variants={itemVariants}>
                <div className="w-14 h-0.5 bg-gradient-to-r from-gold to-transparent" />
              </motion.div>

              {/* Description */}
              <motion.p
                variants={itemVariants}
                className="text-gray text-base md:text-lg leading-relaxed max-w-md"
              >
                {slide.description}
              </motion.p>

              {/* CTAs */}
              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start gap-3 pt-2">
                <Link
                  href={slide.ctaLink || "/products"}
                  className="btn-gold text-sm px-7 py-3.5 group"
                  id="hero-cta-primary"
                >
                  <ShoppingBag size={16} />
                  {slide.ctaText || "Shop Now"}
                  <ArrowRight
                    size={15}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </Link>

                {slide.ctaSecondaryText && (
                  <a
                    href={
                      slide.ctaSecondaryLink ||
                      `https://wa.me/${whatsappNumber}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-whatsapp text-sm px-7 py-3.5"
                    id="hero-cta-secondary"
                  >
                    <MessageCircle size={16} fill="white" />
                    {slide.ctaSecondaryText}
                  </a>
                )}
              </motion.div>

              {/* Slide navigation */}
              {totalSlides > 1 && (
                <motion.div variants={itemVariants} className="flex items-center gap-3 pt-4">
                  {activeSlides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => goToSlide(i)}
                      aria-label={`Go to slide ${i + 1}`}
                      className="relative h-1 rounded-full overflow-hidden transition-all duration-500"
                      style={{ width: i === currentIndex ? "40px" : "12px", background: "rgba(200,169,110,0.25)" }}
                    >
                      {i === currentIndex && (
                        <motion.div
                          className="absolute inset-y-0 left-0 bg-gold rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      )}
                    </button>
                  ))}
                  <span className="text-xs text-gray-400 ml-1 tabular-nums">
                    {currentIndex + 1} / {totalSlides}
                  </span>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* RIGHT — Hero Image */}
        <div className="w-full lg:w-[45%] relative flex items-center justify-center py-12 lg:py-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id + "-img"}
              variants={imageVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="relative w-full max-w-[420px] lg:max-w-none"
            >
              {slide.imageUrl ? (
                <>
                  {/* Floating glow behind image */}
                  <div className="absolute inset-0 rounded-3xl bg-gold/12 blur-3xl scale-90 translate-y-6" />

                  {/* Main image container */}
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/5] border border-gold/10">
                    <Image
                      src={cloudinaryImg(slide.imageUrl, { w: 800, h: 1000, quality: "best" })}
                      alt={slide.imageAlt || slide.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 90vw, 45vw"
                      priority
                    />
                    {/* Subtle gradient overlay at bottom */}
                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/30 to-transparent" />
                  </div>

                  {/* Floating stats card — bottom left */}
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute -bottom-5 -left-5 lg:-left-10 bg-white rounded-2xl shadow-xl px-5 py-3.5 border border-gold/15 backdrop-blur-sm"
                  >
                    <p className="text-[0.6rem] tracking-[0.18em] text-gold-dark uppercase font-semibold mb-0.5">
                      Starting From
                    </p>
                    <p className="text-xl font-bold text-black" style={{ fontFamily: "var(--font-serif)" }}>
                      ₹299
                    </p>
                    <p className="text-[0.65rem] text-gray mt-0.5">Free shipping included</p>
                  </motion.div>

                  {/* Floating trust badge — top right */}
                  <motion.div
                    initial={{ opacity: 0, y: -15, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.65, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute -top-4 -right-4 lg:-right-8 bg-white rounded-2xl shadow-xl px-4 py-3 border border-gold/15"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">⭐</span>
                      <div>
                        <p className="text-xs font-bold text-black">4.9 / 5</p>
                        <p className="text-[0.6rem] text-gray">Rated by customers</p>
                      </div>
                    </div>
                  </motion.div>
                </>
              ) : (
                /* No image yet — show elegant placeholder */
                <div className="relative rounded-3xl overflow-hidden aspect-[4/5] bg-gradient-to-br from-cream to-cream-light border-2 border-dashed border-gold/20 flex items-center justify-center">
                  <div className="text-center space-y-3 px-6">
                    <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto">
                      <ShoppingBag size={28} className="text-gold/60" />
                    </div>
                    <p className="text-sm text-gray font-medium">
                      Upload a hero image from
                    </p>
                    <p className="text-xs text-gold-dark font-semibold tracking-wider">
                      Admin → Hero Slides
                    </p>
                  </div>

                  {/* Decorative sparkles */}
                  {[
                    "top-6 left-6", "top-8 right-10", "bottom-10 left-8", "bottom-6 right-6"
                  ].map((pos, i) => (
                    <motion.div
                      key={i}
                      className={`absolute ${pos} w-1.5 h-1.5 rounded-full bg-gold/30`}
                      animate={{ opacity: [0.2, 0.8, 0.2], scale: [1, 1.4, 1] }}
                      transition={{ duration: 2 + i * 0.5, repeat: Infinity, delay: i * 0.3 }}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Subtle float animation wrapper */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </div>

      {/* ── Vertical brand text (desktop) ───────────────────────────────── */}
      <div className="hidden xl:flex absolute right-6 top-1/2 -translate-y-1/2 flex-col items-center gap-3 opacity-40">
        <div className="w-px h-14 bg-gradient-to-b from-transparent to-gold/50" />
        <span
          className="text-[0.55rem] font-bold tracking-[0.4em] text-gold-dark"
          style={{ writingMode: "vertical-rl" }}
        >
          VEYROVA
        </span>
        <div className="w-px h-14 bg-gradient-to-t from-transparent to-gold/50" />
      </div>

      {/* ── Scroll cue ──────────────────────────────────────────────────── */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-40 cursor-default"
        animate={{ y: [0, 5, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-5 h-8 rounded-full border border-gold/40 flex items-start justify-center pt-1.5">
          <div className="w-0.5 h-2 rounded-full bg-gold/60" />
        </div>
      </motion.div>
    </section>
  );
}
