"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, X, ChevronRight, ChevronDown, RotateCcw } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  children: { id: string; name: string; slug: string }[];
}

interface MobileFilterDrawerProps {
  categories: Category[];
  total: number;
}

export default function MobileFilterDrawer({ categories, total }: MobileFilterDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get("category");
  const currentFilter = searchParams.get("filter");
  const currentSort = searchParams.get("sort");

  const activeCount = (currentCategory ? 1 : 0) + (currentFilter ? 1 : 0);

  // Auto-expand category if current category or subcategory is active
  useEffect(() => {
    if (currentCategory) {
      const activeParent = categories.find(
        (c) => c.slug === currentCategory || c.children.some((sub) => sub.slug === currentCategory)
      );
      if (activeParent) {
        setExpandedCategories((prev) => ({ ...prev, [activeParent.id]: true }));
      }
    }
  }, [currentCategory, categories]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleCategory = (catId: string) => {
    setExpandedCategories((prev) => ({ ...prev, [catId]: !prev[catId] }));
  };

  const buildUrl = (paramsToUpdate: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page"); // Reset page when filtering
    Object.entries(paramsToUpdate).forEach(([key, val]) => {
      if (val === null) {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });
    const qs = params.toString();
    return qs ? `/products?${qs}` : "/products";
  };

  const clearAllUrl = () => {
    const params = new URLSearchParams();
    if (currentSort) params.set("sort", currentSort);
    const qs = params.toString();
    return qs ? `/products?${qs}` : "/products";
  };

  return (
    <>
      {/* Trigger Button on Mobile & Tablet */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white border border-gold/30 hover:border-gold text-charcoal hover:text-gold-dark shadow-xs transition-all active:scale-95 shrink-0"
        id="mobile-filters-trigger"
        aria-label="Open product filters"
      >
        <SlidersHorizontal size={14} className="text-gold-dark shrink-0" />
        <span>Filters</span>
        {activeCount > 0 && (
          <span className="w-4.5 h-4.5 min-w-[1.125rem] px-1 rounded-full bg-gold text-white text-[0.65rem] font-bold flex items-center justify-center shrink-0">
            {activeCount}
          </span>
        )}
      </button>

      {/* Slide-over Drawer & Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative w-[85%] max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-250 ease-out">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-lighter">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-gold-dark" />
                <h2 className="text-base font-bold text-black tracking-wide">
                  Filters
                </h2>
                {activeCount > 0 && (
                  <span className="text-xs bg-gold/15 text-gold-dark font-semibold px-2 py-0.5 rounded-full">
                    {activeCount} active
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {activeCount > 0 && (
                  <Link
                    href={clearAllUrl()}
                    onClick={() => setIsOpen(false)}
                    className="text-xs text-gray hover:text-gold-dark flex items-center gap-1 font-medium transition-colors"
                  >
                    <RotateCcw size={12} />
                    <span>Clear</span>
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-gray hover:text-black hover:bg-cream-light transition-colors"
                  aria-label="Close filters"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Scrollable Filters Content */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
              {/* Quick Filters */}
              <div>
                <h3 className="text-xs font-bold text-black uppercase tracking-wider mb-2.5">
                  Quick Filters
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "All Products", value: null, paramKey: "filter" },
                    { label: "Featured", value: "featured", paramKey: "filter" },
                    { label: "New Arrivals", value: "new", paramKey: "filter" },
                    { label: "Best Sellers", value: "bestseller", paramKey: "filter" },
                  ].map((item) => {
                    const isActive =
                      item.value === null
                        ? !currentFilter
                        : currentFilter === item.value;
                    return (
                      <Link
                        key={item.label}
                        href={buildUrl({ [item.paramKey]: item.value })}
                        onClick={() => setIsOpen(false)}
                        className={`px-3 py-2 text-xs rounded-xl font-medium text-center border transition-all ${
                          isActive
                            ? "bg-gold text-white border-gold shadow-xs"
                            : "bg-cream-light border-gold/15 text-charcoal hover:border-gold/40"
                        }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Categories */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="text-xs font-bold text-black uppercase tracking-wider">
                    Categories
                  </h3>
                  {currentCategory && (
                    <Link
                      href={buildUrl({ category: null })}
                      onClick={() => setIsOpen(false)}
                      className="text-[0.7rem] text-gold-dark hover:underline"
                    >
                      Reset Category
                    </Link>
                  )}
                </div>

                <div className="space-y-1 border border-gold/15 rounded-xl p-2 bg-cream-light/40">
                  {categories.map((cat) => {
                    const isParentActive = currentCategory === cat.slug;
                    const hasSubActive = cat.children.some((sub) => sub.slug === currentCategory);
                    const isExpanded = !!expandedCategories[cat.id];

                    return (
                      <div key={cat.id} className="rounded-lg overflow-hidden">
                        <div
                          className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                            isParentActive
                              ? "bg-gold text-white"
                              : hasSubActive
                              ? "bg-gold/15 text-gold-dark"
                              : "text-charcoal hover:bg-white"
                          }`}
                        >
                          <Link
                            href={buildUrl({ category: cat.slug })}
                            onClick={() => setIsOpen(false)}
                            className="flex-1 truncate"
                          >
                            {cat.name}
                          </Link>

                          {cat.children.length > 0 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleCategory(cat.id);
                              }}
                              className="p-1 -mr-1 rounded hover:bg-black/10 transition-colors"
                              aria-label={`Toggle ${cat.name} subcategories`}
                            >
                              {isExpanded ? (
                                <ChevronDown size={14} />
                              ) : (
                                <ChevronRight size={14} />
                              )}
                            </button>
                          )}
                        </div>

                        {/* Subcategories */}
                        {cat.children.length > 0 && isExpanded && (
                          <div className="ml-3 pl-2.5 my-1 border-l-2 border-gold/25 space-y-0.5">
                            {cat.children.map((sub) => {
                              const isSubActive = currentCategory === sub.slug;
                              return (
                                <Link
                                  key={sub.id}
                                  href={buildUrl({ category: sub.slug })}
                                  onClick={() => setIsOpen(false)}
                                  className={`block px-2.5 py-1.5 rounded-lg text-[0.72rem] font-medium transition-colors ${
                                    isSubActive
                                      ? "bg-gold text-white"
                                      : "text-gray hover:text-black hover:bg-white"
                                  }`}
                                >
                                  {sub.name}
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Sticky Bottom Actions */}
            <div className="p-4 border-t border-gray-lighter bg-white">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-full btn-gold py-3 text-xs sm:text-sm font-semibold rounded-xl text-center shadow-md shadow-gold/20"
              >
                View {total} Products
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
