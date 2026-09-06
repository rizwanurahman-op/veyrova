import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/store/ProductCard";
import ProductsFilter from "@/components/store/ProductsFilter";
import ProductFilterChips from "@/components/store/ProductFilterChips";
import MobileFilterDrawer from "@/components/store/MobileFilterDrawer";
import SortSelect from "@/components/store/SortSelect";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Products",
  description: "Browse our complete collection of premium products. Phone cases, electronics, fashion, home & kitchen, beauty, fitness, and gifts at the best prices.",
};

async function getProducts(searchParams: { [key: string]: string | string[] | undefined }) {
  const filter = typeof searchParams.filter === "string" ? searchParams.filter : undefined;
  const category = typeof searchParams.category === "string" ? searchParams.category : undefined;
  const sort = typeof searchParams.sort === "string" ? searchParams.sort : undefined;
  const page = typeof searchParams.page === "string" ? parseInt(searchParams.page) : 1;
  const limit = 12;

  const where: Record<string, unknown> = { status: "ACTIVE" };

  if (filter === "featured") where.isFeatured = true;
  if (filter === "new") where.isNewArrival = true;
  if (filter === "bestseller") where.isBestSeller = true;

  if (category) {
    const cat = await prisma.category.findUnique({
      where: { slug: category },
      include: { children: true },
    });
    if (cat) {
      where.categoryId = { in: [cat.id, ...cat.children.map((c) => c.id)] };
    }
  }

  let orderBy: Record<string, string> = { createdAt: "desc" };
  if (sort === "price-asc") orderBy = { price: "asc" };
  if (sort === "price-desc") orderBy = { price: "desc" };
  if (sort === "newest") orderBy = { createdAt: "desc" };

  const [products, total, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { images: { orderBy: { sortOrder: "asc" } }, category: true },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({
      where: { parentId: null, status: "ACTIVE" },
      include: { children: { where: { status: "ACTIVE" }, orderBy: { sortOrder: "asc" } } },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  return { products, total, totalPages: Math.ceil(total / limit), page, categories };
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await searchParams;
  const { products, total, totalPages, page, categories } = await getProducts(params);

  const filterLabel = params.filter === "featured" ? "Featured" : params.filter === "new" ? "New Arrivals" : params.filter === "bestseller" ? "Best Sellers" : "All";

  const getPaginationUrl = (targetPage: number) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v && typeof v === "string") q.set(k, v);
    });
    q.set("page", String(targetPage));
    return `/products?${q.toString()}`;
  };

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <div className="bg-white border-b border-gold/10 py-6 sm:py-8">
        <div className="container mx-auto px-4 lg:px-6">
          <p className="text-xs tracking-[0.3em] text-gold-dark uppercase mb-1.5 font-medium">
            Our Collection
          </p>
          <h1 className="heading-section text-2xl sm:text-3xl md:text-4xl">
            {filterLabel} Products
          </h1>
          <p className="text-xs sm:text-sm text-gray mt-1.5">{total} products found</p>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-6 py-6 sm:py-8">
        {/* Quick Filter Horizontal Scroll on Mobile & Tablet */}
        <ProductFilterChips categories={categories} />

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block lg:w-64 shrink-0">
            <ProductsFilter categories={categories} />
          </aside>

          {/* Product Grid & Controls */}
          <div className="flex-1 min-w-0">
            {/* Sort & Filter Bar */}
            <div className="flex items-center justify-between gap-2 sm:gap-4 mb-6 bg-white rounded-xl p-2 sm:p-3.5 border border-gold/10 shadow-xs">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                {/* Mobile Filter Drawer Trigger */}
                <div className="lg:hidden shrink-0">
                  <MobileFilterDrawer categories={categories} total={total} />
                </div>
                <span className="text-xs sm:text-sm text-gray truncate">
                  <span className="hidden sm:inline">Showing </span>
                  <span className="font-semibold text-black">{products.length}</span>
                  <span className="hidden sm:inline"> of {total} products</span>
                  <span className="sm:hidden text-gray-light"> of {total}</span>
                </span>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <label className="text-xs sm:text-sm text-gray hidden md:block whitespace-nowrap">Sort by:</label>
                <Suspense fallback={<div className="w-28 h-8 skeleton rounded-lg" />}>
                  <SortSelect defaultValue={typeof params.sort === "string" ? params.sort : "newest"} />
                </Suspense>
              </div>
            </div>

            {/* Products Grid */}
            {products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-gold/10 p-6">
                <p className="text-xl text-gray mb-3" style={{ fontFamily: "var(--font-serif)" }}>
                  No products found
                </p>
                <p className="text-sm text-gray-light mb-6">
                  Try adjusting your filters or browse all products.
                </p>
                <Link href="/products" className="btn-gold !text-xs !py-2.5 !px-5 inline-block">
                  Clear All Filters
                </Link>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <nav aria-label="Pagination" className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mt-10">
                {/* Previous Page */}
                {page > 1 ? (
                  <Link
                    href={getPaginationUrl(page - 1)}
                    className="h-9 sm:h-10 px-3 rounded-lg flex items-center gap-1 text-xs sm:text-sm font-medium bg-white text-charcoal border border-gold/20 hover:border-gold hover:text-gold-dark transition-all"
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={16} />
                    <span className="hidden sm:inline">Prev</span>
                  </Link>
                ) : (
                  <span className="h-9 sm:h-10 px-3 rounded-lg flex items-center gap-1 text-xs sm:text-sm font-medium bg-gray-lighter/50 text-gray-light border border-transparent cursor-not-allowed">
                    <ChevronLeft size={16} />
                    <span className="hidden sm:inline">Prev</span>
                  </span>
                )}

                {/* Page Numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Link
                    key={p}
                    href={getPaginationUrl(p)}
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-xs sm:text-sm font-medium transition-all ${
                      p === page
                        ? "bg-gold text-white shadow-gold font-bold"
                        : "bg-white text-charcoal border border-gold/20 hover:border-gold hover:text-gold-dark"
                    }`}
                    aria-current={p === page ? "page" : undefined}
                  >
                    {p}
                  </Link>
                ))}

                {/* Next Page */}
                {page < totalPages ? (
                  <Link
                    href={getPaginationUrl(page + 1)}
                    className="h-9 sm:h-10 px-3 rounded-lg flex items-center gap-1 text-xs sm:text-sm font-medium bg-white text-charcoal border border-gold/20 hover:border-gold hover:text-gold-dark transition-all"
                    aria-label="Next page"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight size={16} />
                  </Link>
                ) : (
                  <span className="h-9 sm:h-10 px-3 rounded-lg flex items-center gap-1 text-xs sm:text-sm font-medium bg-gray-lighter/50 text-gray-light border border-transparent cursor-not-allowed">
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight size={16} />
                  </span>
                )}
              </nav>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
