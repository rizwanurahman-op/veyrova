import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/store/ProductCard";
import { Search } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search Products",
  description: "Search through our premium product collection at VEYROVA.",
};

async function searchProducts(query: string) {
  if (!query || query.trim().length === 0) return [];

  return prisma.product.findMany({
    where: {
      status: "ACTIVE",
      OR: [
        { name: { contains: query } },
        { description: { contains: query } },
        { shortDescription: { contains: query } },
        { sku: { contains: query } },
      ],
    },
    include: { images: { orderBy: { sortOrder: "asc" } } },
    take: 24,
  });
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q : "";
  const products = await searchProducts(query);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gold/10 py-8">
        <div className="container mx-auto px-4 lg:px-6">
          <p className="text-xs tracking-[0.3em] text-gold-dark uppercase mb-2 font-medium">
            Search Results
          </p>
          <h1 className="heading-section text-3xl md:text-4xl">
            {query ? (
              <>Results for &ldquo;{query}&rdquo;</>
            ) : (
              "Search Products"
            )}
          </h1>
          {query && (
            <p className="text-sm text-gray mt-2">{products.length} results found</p>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-6 py-8">
        {/* Search Form */}
        <form action="/search" method="get" className="max-w-2xl mx-auto mb-10">
          <div className="relative">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-light" />
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search for products, categories..."
              className="w-full pl-12 pr-4 py-4 bg-white border border-gold/20 rounded-2xl text-base focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all shadow-sm"
              id="search-page-input"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 btn-gold !py-2.5 !px-6 !rounded-xl"
              id="search-page-submit"
            >
              Search
            </button>
          </div>
        </form>

        {/* Results */}
        {query && products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : query ? (
          <div className="text-center py-20">
            <Search size={48} className="text-gold/30 mx-auto mb-4" />
            <p className="text-xl text-gray mb-4" style={{ fontFamily: "var(--font-serif)" }}>
              No products found
            </p>
            <p className="text-sm text-gray-light mb-6">
              Try different keywords or browse our categories.
            </p>
            <Link href="/products" className="btn-gold">
              Browse All Products
            </Link>
          </div>
        ) : (
          <div className="text-center py-20">
            <Search size={48} className="text-gold/30 mx-auto mb-4" />
            <p className="text-xl text-gray" style={{ fontFamily: "var(--font-serif)" }}>
              Start typing to search
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
