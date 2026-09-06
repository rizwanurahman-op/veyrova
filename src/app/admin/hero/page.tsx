"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Save,
  Plus,
  Trash2,
  GripVertical,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
} from "lucide-react";
import ImageUploader, { type UploadedImage } from "@/components/admin/ImageUploader";

type HeroSlide = {
  id: string;
  title: string;
  subtitle: string;
  tagline: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  ctaSecondaryText: string;
  ctaSecondaryLink: string;
  imageUrl: string;
  imageAlt: string;
  active: boolean;
  sortOrder: number;
};

const emptySlide = (): HeroSlide => ({
  id: `slide-${Date.now()}`,
  title: "",
  subtitle: "",
  tagline: "",
  description: "",
  ctaText: "Shop Now",
  ctaLink: "/products",
  ctaSecondaryText: "Shop on WhatsApp",
  ctaSecondaryLink: "",
  imageUrl: "",
  imageAlt: "",
  active: true,
  sortOrder: 0,
});

function SlideEditor({
  slide,
  index,
  total,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  slide: HeroSlide;
  index: number;
  total: number;
  onChange: (slide: HeroSlide) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const [expanded, setExpanded] = useState(index === 0);
  const [isUploading, setIsUploading] = useState(false);

  const set = (key: keyof HeroSlide, value: string | boolean) =>
    onChange({ ...slide, [key]: value });

  // Adapter: ImageUploader works with UploadedImage[], hero uses single imageUrl
  const heroImages: UploadedImage[] = slide.imageUrl
    ? [{ url: slide.imageUrl, altText: slide.imageAlt || "", isPrimary: true }]
    : [];

  const handleImagesChange = (imgs: UploadedImage[]) => {
    const primary = imgs[0];
    onChange({
      ...slide,
      imageUrl: primary?.url || "",
      imageAlt: primary?.altText || "",
    });
  };

  return (
    <div className="bg-white border border-gold/20 rounded-2xl overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-cream/50 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex flex-col gap-1 cursor-grab text-gray-300">
          <GripVertical size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-black truncate">
            Slide {index + 1}
            {slide.title && (
              <span className="font-normal text-gray ml-2">— {slide.title}</span>
            )}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {slide.active ? "● Active" : "○ Inactive"}
          </p>
        </div>
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => set("active", !slide.active)}
            title={slide.active ? "Deactivate slide" : "Activate slide"}
            className={`p-1.5 rounded-lg transition-colors ${
              slide.active
                ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                : "bg-gray-100 text-gray-400 hover:bg-gray-200"
            }`}
          >
            {slide.active ? <Eye size={15} /> : <EyeOff size={15} />}
          </button>
          <button
            type="button"
            onClick={onMoveUp}
            disabled={index === 0}
            className="p-1.5 rounded-lg bg-gray-50 text-gray-400 hover:bg-gray-100 disabled:opacity-30 transition-colors"
          >
            <ChevronUp size={15} />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={index === total - 1}
            className="p-1.5 rounded-lg bg-gray-50 text-gray-400 hover:bg-gray-100 disabled:opacity-30 transition-colors"
          >
            <ChevronDown size={15} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 transition-colors"
          >
            <Trash2 size={15} />
          </button>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="p-1.5 rounded-lg bg-gray-50 text-gray-400 hover:bg-gray-100 transition-colors"
          >
            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>
      </div>

      {/* Expanded body */}
      {expanded && (
        <div className="px-5 pb-6 border-t border-gold/10 pt-5 space-y-5">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-black mb-2 flex items-center gap-2">
              <ImageIcon size={15} />
              Hero Image (Right Side)
            </label>
            <ImageUploader
              images={heroImages}
              onChange={handleImagesChange}
              productName={slide.title}
              onUploadingChange={setIsUploading}
            />
            {isUploading && (
              <p className="text-xs text-gold-dark mt-2 animate-pulse">Uploading image…</p>
            )}
          </div>

          {/* Text Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: "tagline", label: "Tagline (small pill text)", placeholder: "Best Quality • Fast Delivery" },
              { key: "title", label: "Title (large heading)", placeholder: "Exclusive Deals" },
              { key: "subtitle", label: "Subtitle (gold shimmer text)", placeholder: "Up to 60% Off" },
            ].map(({ key, label, placeholder }) => (
              <div key={key} className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
                <input
                  type="text"
                  value={String((slide as unknown as Record<string, unknown>)[key] ?? "")}
                  onChange={(e) => set(key as keyof HeroSlide, e.target.value)}
                  placeholder={placeholder}
                  className="w-full px-4 py-2.5 bg-cream-light border border-gold/20 rounded-xl text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all"
                />
              </div>
            ))}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
              <textarea
                value={slide.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Brief compelling description…"
                rows={2}
                className="w-full px-4 py-2.5 bg-cream-light border border-gold/20 rounded-xl text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all resize-none"
              />
            </div>

            {/* CTAs */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Primary CTA Text</label>
              <input
                type="text"
                value={slide.ctaText}
                onChange={(e) => set("ctaText", e.target.value)}
                placeholder="Shop Now"
                className="w-full px-4 py-2.5 bg-cream-light border border-gold/20 rounded-xl text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Primary CTA Link</label>
              <input
                type="text"
                value={slide.ctaLink}
                onChange={(e) => set("ctaLink", e.target.value)}
                placeholder="/products?filter=featured"
                className="w-full px-4 py-2.5 bg-cream-light border border-gold/20 rounded-xl text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Secondary CTA Text</label>
              <input
                type="text"
                value={slide.ctaSecondaryText}
                onChange={(e) => set("ctaSecondaryText", e.target.value)}
                placeholder="Shop on WhatsApp"
                className="w-full px-4 py-2.5 bg-cream-light border border-gold/20 rounded-xl text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Secondary CTA Link</label>
              <input
                type="text"
                value={slide.ctaSecondaryLink}
                onChange={(e) => set("ctaSecondaryLink", e.target.value)}
                placeholder="https://wa.me/91..."
                className="w-full px-4 py-2.5 bg-cream-light border border-gold/20 rounded-xl text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminHeroPage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/hero")
      .then((r) => r.json())
      .then((d) => setSlides(d.slides || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updateSlide = useCallback((id: string, updated: HeroSlide) => {
    setSlides((prev) => prev.map((s) => (s.id === id ? updated : s)));
    setSaved(false);
  }, []);

  const addSlide = () => {
    const newSlide = { ...emptySlide(), sortOrder: slides.length };
    setSlides((prev) => [...prev, newSlide]);
    setSaved(false);
  };

  const deleteSlide = (id: string) => {
    setSlides((prev) => prev.filter((s) => s.id !== id));
    setSaved(false);
  };

  const moveSlide = (index: number, direction: "up" | "down") => {
    const updated = [...slides];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]];
    setSlides(updated.map((s, i) => ({ ...s, sortOrder: i })));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/hero", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slides: slides.map((s, i) => ({ ...s, sortOrder: i })) }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        alert("Failed to save hero slides");
      }
    } catch {
      alert("Error saving hero slides");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-black" style={{ fontFamily: "var(--font-serif)" }}>
            Hero Slides
          </h1>
          <p className="text-sm text-gray mt-1">
            Manage the homepage hero carousel — images, text, and CTAs
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={addSlide}
            className="btn-outline !text-sm"
          >
            <Plus size={16} />
            Add Slide
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="btn-gold !text-sm disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? "Saving…" : saved ? "✓ Saved!" : "Save Changes"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray">Loading slides…</div>
      ) : slides.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gold/10">
          <p className="text-gray mb-4">No slides yet</p>
          <button type="button" onClick={addSlide} className="btn-gold !text-sm">
            <Plus size={16} />
            Add First Slide
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {slides.map((slide, index) => (
            <SlideEditor
              key={slide.id}
              slide={slide}
              index={index}
              total={slides.length}
              onChange={(updated) => updateSlide(slide.id, updated)}
              onDelete={() => deleteSlide(slide.id)}
              onMoveUp={() => moveSlide(index, "up")}
              onMoveDown={() => moveSlide(index, "down")}
            />
          ))}
        </div>
      )}

      {/* Tips */}
      <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 text-sm">
        <p className="font-semibold text-amber-800 mb-1">💡 Tips for best results</p>
        <ul className="text-amber-700 text-xs space-y-1 list-disc list-inside">
          <li>Upload a square or portrait image (1:1 or 3:4) for the right side — product photos work best</li>
          <li>Keep titles short (2–3 words) — they display very large</li>
          <li>Subtitles appear in the gold shimmer style — make them punchy</li>
          <li>Use the eye icon to hide a slide without deleting it</li>
          <li>Changes only go live after clicking "Save Changes"</li>
        </ul>
      </div>
    </div>
  );
}
