"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft, Plus, X } from "lucide-react";
import Link from "next/link";
import ImageUploader, { type UploadedImage } from "@/components/admin/ImageUploader";

interface Category {
  id: string;
  name: string;
  slug: string;
  children?: Category[];
}

interface ProductFormProps {
  product?: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    shortDescription: string | null;
    price: number;
    comparePrice: number | null;
    sku: string | null;
    stock: number;
    categoryId: string | null;
    status: string;
    isFeatured: boolean;
    isNewArrival: boolean;
    isBestSeller: boolean;
    specifications: string | null;
    seoTitle: string | null;
    seoDescription: string | null;
    dispatchDays: number;
    images: { id: string; url: string; altText: string | null; isPrimary: boolean }[];
  };
}

export default function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([]);
  const [images, setImages] = useState<UploadedImage[]>([]);

  const [form, setForm] = useState({
    name: product?.name || "",
    description: product?.description || "",
    shortDescription: product?.shortDescription || "",
    price: product?.price || 0,
    comparePrice: product?.comparePrice || 0,
    sku: product?.sku || "",
    stock: product?.stock || 0,
    categoryId: product?.categoryId || "",
    status: product?.status || "DRAFT",
    isFeatured: product?.isFeatured || false,
    isNewArrival: product?.isNewArrival || false,
    isBestSeller: product?.isBestSeller || false,
    seoTitle: product?.seoTitle || "",
    seoDescription: product?.seoDescription || "",
    dispatchDays: product?.dispatchDays || 0,
  });

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []))
      .catch(() => {});

    if (product?.specifications) {
      try {
        const parsed = JSON.parse(product.specifications);
        setSpecs(Object.entries(parsed).map(([key, value]) => ({ key, value: value as string })));
      } catch {}
    }

    if (product?.images) {
      setImages(product.images.map((img) => ({
        url: img.url,
        altText: img.altText || "",
        isPrimary: img.isPrimary,
      })));
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const specifications: Record<string, string> = {};
    specs.forEach((s) => {
      if (s.key.trim()) specifications[s.key.trim()] = s.value.trim();
    });

    const body = {
      ...form,
      specifications: JSON.stringify(specifications),
      images: images.map((img, i) => ({ ...img, sortOrder: i, isPrimary: i === 0 })),
    };

    try {
      const url = product ? `/api/admin/products/${product.id}` : "/api/admin/products";
      const method = product ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        router.push("/admin/products");
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to save product");
      }
    } catch {
      alert("Error saving product");
    } finally {
      setLoading(false);
    }
  };

  const addSpec = () => setSpecs([...specs, { key: "", value: "" }]);
  const removeSpec = (i: number) => setSpecs(specs.filter((_, idx) => idx !== i));



  // Flatten categories for select
  const flatCategories: { id: string; name: string; depth: number }[] = [];
  categories.forEach((cat) => {
    flatCategories.push({ id: cat.id, name: cat.name, depth: 0 });
    cat.children?.forEach((sub) => {
      flatCategories.push({ id: sub.id, name: sub.name, depth: 1 });
    });
  });

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/products" className="p-2 rounded-lg bg-white border border-gray-lighter hover:border-gold transition-all">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-black" style={{ fontFamily: "var(--font-serif)" }}>
            {product ? "Edit Product" : "Add New Product"}
          </h1>
        </div>
        <button
          type="submit"
          disabled={loading || isUploading}
          className="btn-gold !text-sm w-full sm:w-auto justify-center disabled:opacity-60 disabled:cursor-not-allowed shadow-xs"
        >
          <Save size={16} />
          {loading ? "Saving..." : isUploading ? "Uploading images..." : "Save Product"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-xl border border-gold/10 p-4 sm:p-5">
            <h3 className="font-semibold text-black mb-4" style={{ fontFamily: "var(--font-serif)" }}>Basic Information</h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray uppercase tracking-wider mb-1.5 block">Product Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 bg-cream-light border border-gold/20 rounded-xl text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all"
                  placeholder="e.g., iPhone 15 Plus Designer Case"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray uppercase tracking-wider mb-1.5 block">Short Description</label>
                <input
                  type="text"
                  value={form.shortDescription}
                  onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                  className="w-full px-4 py-2.5 bg-cream-light border border-gold/20 rounded-xl text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all"
                  placeholder="Brief one-line description"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray uppercase tracking-wider mb-1.5 block">Full Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={5}
                  className="w-full px-4 py-2.5 bg-cream-light border border-gold/20 rounded-xl text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all resize-none"
                  placeholder="Detailed product description..."
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-xl border border-gold/10 p-4 sm:p-5">
            <h3 className="font-semibold text-black mb-4" style={{ fontFamily: "var(--font-serif)" }}>Product Images</h3>
            <ImageUploader
              images={images}
              onChange={setImages}
              productName={form.name}
              onUploadingChange={setIsUploading}
            />
          </div>

          {/* Specifications */}
          <div className="bg-white rounded-xl border border-gold/10 p-4 sm:p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-black" style={{ fontFamily: "var(--font-serif)" }}>Specifications</h3>
              <button type="button" onClick={addSpec} className="text-xs text-gold-dark hover:text-gold flex items-center gap-1">
                <Plus size={14} /> Add Spec
              </button>
            </div>

            <div className="space-y-3">
              {specs.map((spec, i) => (
                <div key={i} className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                  <input
                    type="text"
                    value={spec.key}
                    onChange={(e) => {
                      const newSpecs = [...specs];
                      newSpecs[i].key = e.target.value;
                      setSpecs(newSpecs);
                    }}
                    placeholder="Key (e.g., Material)"
                    className="flex-1 px-3 py-2 bg-cream-light border border-gold/20 rounded-lg text-sm focus:outline-none focus:border-gold transition-all"
                  />
                  <div className="flex-1 flex gap-2 items-center">
                    <input
                      type="text"
                      value={spec.value}
                      onChange={(e) => {
                        const newSpecs = [...specs];
                        newSpecs[i].value = e.target.value;
                        setSpecs(newSpecs);
                      }}
                      placeholder="Value (e.g., Premium TPU)"
                      className="flex-1 px-3 py-2 bg-cream-light border border-gold/20 rounded-lg text-sm focus:outline-none focus:border-gold transition-all"
                    />
                    <button type="button" onClick={() => removeSpec(i)} className="p-2 sm:p-1.5 text-gray hover:text-red-500 transition-colors shrink-0">
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {specs.length === 0 && (
                <p className="text-xs text-gray text-center py-2">No specifications. Click &quot;Add Spec&quot; to add.</p>
              )}
            </div>
          </div>

          {/* SEO */}
          <div className="bg-white rounded-xl border border-gold/10 p-4 sm:p-5">
            <h3 className="font-semibold text-black mb-4" style={{ fontFamily: "var(--font-serif)" }}>SEO</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray uppercase tracking-wider mb-1.5 block">SEO Title</label>
                <input
                  type="text"
                  value={form.seoTitle}
                  onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
                  className="w-full px-4 py-2.5 bg-cream-light border border-gold/20 rounded-xl text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all"
                  placeholder="SEO page title"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray uppercase tracking-wider mb-1.5 block">SEO Description</label>
                <textarea
                  value={form.seoDescription}
                  onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2.5 bg-cream-light border border-gold/20 rounded-xl text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all resize-none"
                  placeholder="Meta description for search engines"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status & Category */}
          <div className="bg-white rounded-xl border border-gold/10 p-4 sm:p-5">
            <h3 className="font-semibold text-black mb-4" style={{ fontFamily: "var(--font-serif)" }}>Publish</h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray uppercase tracking-wider mb-1.5 block">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-4 py-2.5 bg-cream-light border border-gold/20 rounded-xl text-sm focus:outline-none focus:border-gold transition-all"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray uppercase tracking-wider mb-1.5 block">Category</label>
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  className="w-full px-4 py-2.5 bg-cream-light border border-gold/20 rounded-xl text-sm focus:outline-none focus:border-gold transition-all"
                >
                  <option value="">Select category</option>
                  {flatCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.depth > 0 ? "  └─ " : ""}{cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-xl border border-gold/10 p-4 sm:p-5">
            <h3 className="font-semibold text-black mb-4" style={{ fontFamily: "var(--font-serif)" }}>Pricing</h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray uppercase tracking-wider mb-1.5 block">Selling Price (₹) *</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                  required
                  min="0"
                  className="w-full px-4 py-2.5 bg-cream-light border border-gold/20 rounded-xl text-sm focus:outline-none focus:border-gold transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray uppercase tracking-wider mb-1.5 block">Compare / MRP (₹)</label>
                <input
                  type="number"
                  value={form.comparePrice}
                  onChange={(e) => setForm({ ...form, comparePrice: parseFloat(e.target.value) || 0 })}
                  min="0"
                  className="w-full px-4 py-2.5 bg-cream-light border border-gold/20 rounded-xl text-sm focus:outline-none focus:border-gold transition-all"
                />
              </div>
            </div>
          </div>

          {/* Inventory */}
          <div className="bg-white rounded-xl border border-gold/10 p-4 sm:p-5">
            <h3 className="font-semibold text-black mb-4" style={{ fontFamily: "var(--font-serif)" }}>Inventory</h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray uppercase tracking-wider mb-1.5 block">SKU</label>
                <input
                  type="text"
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  className="w-full px-4 py-2.5 bg-cream-light border border-gold/20 rounded-xl text-sm focus:outline-none focus:border-gold transition-all"
                  placeholder="e.g., VR-PC-001"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray uppercase tracking-wider mb-1.5 block">Stock Quantity</label>
                <input
                  type="number"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })}
                  min="0"
                  className="w-full px-4 py-2.5 bg-cream-light border border-gold/20 rounded-xl text-sm focus:outline-none focus:border-gold transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray uppercase tracking-wider mb-1.5 block">Dispatch Days</label>
                <input
                  type="number"
                  value={form.dispatchDays}
                  onChange={(e) => setForm({ ...form, dispatchDays: parseInt(e.target.value) || 0 })}
                  min="0"
                  className="w-full px-4 py-2.5 bg-cream-light border border-gold/20 rounded-xl text-sm focus:outline-none focus:border-gold transition-all"
                />
              </div>
            </div>
          </div>

          {/* Flags */}
          <div className="bg-white rounded-xl border border-gold/10 p-4 sm:p-5">
            <h3 className="font-semibold text-black mb-4" style={{ fontFamily: "var(--font-serif)" }}>Visibility</h3>

            <div className="space-y-3">
              {[
                { key: "isFeatured" as const, label: "Featured Product" },
                { key: "isNewArrival" as const, label: "New Arrival" },
                { key: "isBestSeller" as const, label: "Best Seller" },
              ].map((flag) => (
                <label key={flag.key} className="flex items-center gap-3 cursor-pointer py-1">
                  <input
                    type="checkbox"
                    checked={form[flag.key]}
                    onChange={(e) => setForm({ ...form, [flag.key]: e.target.checked })}
                    className="w-4 h-4 accent-gold rounded"
                  />
                  <span className="text-sm text-charcoal">{flag.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
