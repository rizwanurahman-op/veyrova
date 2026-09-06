import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/store/ProductCard";
import SortSelect from "@/components/store/SortSelect";
import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";

async function getCategory(slug: string) {
  const category = await prisma.category.findUnique({
    where: { slug, status: "ACTIVE" },
    include: {
      parent: {
        include: {
          children: {
            where: { status: "ACTIVE" },
            orderBy: { sortOrder: "asc" },
            include: { _count: { select: { products: true } } },
          },
        },
      },
      children: {
        where: { status: "ACTIVE" },
        orderBy: { sortOrder: "asc" },
        include: { _count: { select: { products: true } } },
      },
    },
  });
  return category;
}

async function getCategoryProducts(categoryId: string, childIds: string[], sort?: string) {
  let orderBy: Record<string, string> = { createdAt: "desc" };
  if (sort === "price-asc") orderBy = { price: "asc" };
  if (sort === "price-desc") orderBy = { price: "desc" };
  if (sort === "newest") orderBy = { createdAt: "desc" };

  return prisma.product.findMany({
    where: {
      status: "ACTIVE",
      categoryId: { in: [categoryId, ...childIds] },
    },
    include: { images: { orderBy: { sortOrder: "asc" } } },
    orderBy,
  });
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return { title: "Category Not Found" };

  return {
    title: `${category.name} — VEYROVA`,
    description: category.description || `Browse ${category.name} products at VEYROVA. Best quality, great deals, fast delivery.`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  const sParams = searchParams ? await searchParams : {};
  const sort = typeof sParams.sort === "string" ? sParams.sort : "newest";

  const category = await getCategory(slug);

  if (!category) notFound();

  const products = await getCategoryProducts(
    category.id,
    category.children.map((c) => c.id),
    sort
  );

  const isChild = !!category.parent;
  const parentCategory = category.parent;
  const subcategoriesList = isChild
    ? parentCategory?.children || []
    : category.children;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gold/10 py-6 sm:py-8">
        <div className="container mx-auto px-4 lg:px-6">
          {/* Breadcrumb */}
          <nav className="flex flex-wrap items-center gap-1.5 text-xs text-gray mb-3 sm:mb-4" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-gold-dark transition-colors shrink-0">Home</Link>
            <ChevronRight size={12} className="shrink-0 text-gray/50" />
            {parentCategory && (
              <>
                <Link href={`/categories/${parentCategory.slug}`} className="hover:text-gold-dark transition-colors shrink-0">
                  {parentCategory.name}
                </Link>
                <ChevronRight size={12} className="shrink-0 text-gray/50" />
              </>
            )}
            <span className="text-black font-medium truncate max-w-[220px] sm:max-w-none">{category.name}</span>
          </nav>

          <p className="text-xs tracking-[0.3em] text-gold-dark uppercase mb-1.5 font-medium">
            Category
          </p>
          <h1 className="heading-section text-2xl sm:text-3xl md:text-4xl mb-2">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-xs sm:text-sm text-gray max-w-xl leading-relaxed">{category.description}</p>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-6 py-6 sm:py-8">
        {/* Horizontal Scrollable Subcategories & Sibling Pills */}
        {subcategoriesList.length > 0 && (
          <div className="mb-6 sm:mb-8 overflow-hidden">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {parentCategory && (
                <Link
                  href={`/categories/${parentCategory.slug}`}
                  className="shrink-0 px-3.5 py-1.5 text-xs font-semibold rounded-full bg-white text-charcoal border border-gold/25 hover:border-gold hover:text-gold-dark transition-all shadow-xs"
                >
                  All {parentCategory.name}
                </Link>
              )}
              {!isChild && (
                <span
                  className="shrink-0 px-3.5 py-1.5 text-xs font-semibold bg-gold text-white rounded-full shadow-xs"
                >
                  All {category.name}
                </span>
              )}
              {subcategoriesList.map((sub) => {
                const isActive = sub.slug === category.slug;
                return (
                  <Link
                    key={sub.id}
                    href={`/categories/${sub.slug}`}
                    className={`shrink-0 px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all ${
                      isActive
                        ? "bg-gold text-white shadow-xs"
                        : "bg-white text-charcoal border border-gold/25 hover:border-gold hover:text-gold-dark shadow-xs"
                    }`}
                  >
                    {sub.name}
                    {sub._count?.products ? ` (${sub._count.products})` : ""}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Sort & Count Bar */}
        <div className="flex items-center justify-between gap-2 sm:gap-4 mb-6 bg-white rounded-xl p-2.5 sm:p-3.5 border border-gold/10 shadow-xs">
          <span className="text-xs sm:text-sm text-gray truncate">
            <span className="hidden sm:inline">Showing </span>
            <span className="font-semibold text-black">{products.length}</span>
            <span className="text-gray"> product{products.length !== 1 ? "s" : ""}</span>
          </span>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <label className="text-xs sm:text-sm text-gray hidden sm:block whitespace-nowrap">Sort by:</label>
            <Suspense fallback={<div className="w-28 h-8 skeleton rounded-lg" />}>
              <SortSelect defaultValue={sort} />
            </Suspense>
          </div>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 sm:py-20 bg-white rounded-2xl border border-gold/10 p-6 max-w-md mx-auto shadow-xs">
            <p className="text-xl text-gray mb-3" style={{ fontFamily: "var(--font-serif)" }}>
              No products in this category yet
            </p>
            <p className="text-sm text-gray-light mb-6">
              Check back soon for new arrivals!
            </p>
            <Link href="/products" className="btn-gold !text-xs !py-2.5 !px-5 inline-block">
              Browse All Products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
