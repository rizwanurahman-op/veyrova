"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronRight, RotateCcw } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  children: { id: string; name: string; slug: string }[];
}

export default function ProductsFilter({ categories }: { categories: Category[] }) {
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category");
  const currentFilter = searchParams.get("filter");
  const currentSort = searchParams.get("sort");

  const hasActiveFilters = !!currentCategory || !!currentFilter;

  const buildUrl = (paramsToUpdate: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
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
    <div className="space-y-6">
      {/* Quick Filters */}
      <div className="bg-white rounded-xl p-5 border border-gold/10 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-black tracking-wider uppercase">
            Quick Filters
          </h3>
          {hasActiveFilters && (
            <Link
              href={clearAllUrl()}
              className="text-xs text-gold-dark hover:underline flex items-center gap-1 font-medium"
            >
              <RotateCcw size={11} />
              <span>Reset</span>
            </Link>
          )}
        </div>
        <div className="gold-divider mb-3" />
        <div className="space-y-1">
          {[
            { label: "All Products", value: null },
            { label: "Featured", value: "featured" },
            { label: "New Arrivals", value: "new" },
            { label: "Best Sellers", value: "bestseller" },
          ].map((item) => {
            const isActive =
              item.value === null
                ? !currentFilter && !currentCategory
                : currentFilter === item.value;
            return (
              <Link
                key={item.label}
                href={buildUrl({ filter: item.value, ...(item.value === null ? { category: null } : {}) })}
                className={`block px-3 py-2 text-sm rounded-lg transition-all ${
                  isActive
                    ? "bg-gold/10 text-gold-dark font-medium"
                    : "text-charcoal hover:bg-cream-light hover:text-gold-dark"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white rounded-xl p-5 border border-gold/10 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-black tracking-wider uppercase">
            Categories
          </h3>
          {currentCategory && (
            <Link
              href={buildUrl({ category: null })}
              className="text-xs text-gold-dark hover:underline font-medium"
            >
              All
            </Link>
          )}
        </div>
        <div className="gold-divider mb-3" />
        <div className="space-y-1">
          {categories.map((cat) => {
            const isCategoryActive = currentCategory === cat.slug;
            return (
              <div key={cat.id}>
                <Link
                  href={buildUrl({ category: isCategoryActive ? null : cat.slug, filter: null })}
                  className={`flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-all ${
                    isCategoryActive
                      ? "bg-gold/10 text-gold-dark font-medium"
                      : "text-charcoal hover:bg-cream-light hover:text-gold-dark"
                  }`}
                >
                  {cat.name}
                  <ChevronRight size={14} className="opacity-50" />
                </Link>
                {cat.children.length > 0 && (
                  <div className="ml-3 border-l-2 border-gold/10 pl-2">
                    {cat.children.map((sub) => {
                      const isSubActive = currentCategory === sub.slug;
                      return (
                        <Link
                          key={sub.id}
                          href={buildUrl({ category: isSubActive ? null : sub.slug, filter: null })}
                          className={`block px-3 py-1.5 text-xs rounded-lg transition-all ${
                            isSubActive
                              ? "bg-gold/10 text-gold-dark font-medium"
                              : "text-gray hover:bg-cream-light hover:text-gold-dark"
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
  );
}
