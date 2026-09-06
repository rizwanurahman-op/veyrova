"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductFilterChipsProps {
  categories: Category[];
}

export default function ProductFilterChips({ categories }: ProductFilterChipsProps) {
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category");
  const currentFilter = searchParams.get("filter");

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

  const isAllActive = !currentCategory && !currentFilter;

  return (
    <div className="lg:hidden w-full mb-4 overflow-hidden">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {/* All Products */}
        <Link
          href={buildUrl({ filter: null, category: null })}
          className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
            isAllActive
              ? "bg-gold text-white shadow-xs"
              : "bg-white border border-gold/25 text-charcoal hover:border-gold hover:text-gold-dark"
          }`}
        >
          All
        </Link>

        {/* Quick Filter: Featured */}
        <Link
          href={buildUrl({ filter: currentFilter === "featured" ? null : "featured", category: null })}
          className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
            currentFilter === "featured"
              ? "bg-gold text-white shadow-xs"
              : "bg-white border border-gold/25 text-charcoal hover:border-gold hover:text-gold-dark"
          }`}
        >
          Featured
        </Link>

        {/* Quick Filter: New Arrivals */}
        <Link
          href={buildUrl({ filter: currentFilter === "new" ? null : "new", category: null })}
          className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
            currentFilter === "new"
              ? "bg-gold text-white shadow-xs"
              : "bg-white border border-gold/25 text-charcoal hover:border-gold hover:text-gold-dark"
          }`}
        >
          New Arrivals
        </Link>

        {/* Quick Filter: Best Sellers */}
        <Link
          href={buildUrl({ filter: currentFilter === "bestseller" ? null : "bestseller", category: null })}
          className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
            currentFilter === "bestseller"
              ? "bg-gold text-white shadow-xs"
              : "bg-white border border-gold/25 text-charcoal hover:border-gold hover:text-gold-dark"
          }`}
        >
          Best Sellers
        </Link>

        {/* Categories */}
        {categories.map((cat) => {
          const isActive = currentCategory === cat.slug;
          return (
            <Link
              key={cat.id}
              href={buildUrl({ category: isActive ? null : cat.slug, filter: null })}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                isActive
                  ? "bg-gold text-white shadow-xs"
                  : "bg-white border border-gold/25 text-charcoal hover:border-gold hover:text-gold-dark"
              }`}
            >
              {cat.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
