import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice, getDiscountPercent } from "@/lib/utils";
import ProductCard from "@/components/store/ProductCard";
import ProductActions from "@/components/store/ProductActions";
import ProductImageGallery from "@/components/store/ProductImageGallery";
import {
  ChevronRight,
  Truck,
  ShieldCheck,
  Package,
  Star,
} from "lucide-react";
import type { Metadata } from "next";

async function getProduct(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug, status: "ACTIVE" },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      category: {
        include: { parent: true },
      },
    },
  });
  return product;
}

async function getRelatedProducts(categoryId: string | null, productId: string) {
  if (!categoryId) return [];
  return prisma.product.findMany({
    where: {
      categoryId,
      status: "ACTIVE",
      id: { not: productId },
    },
    include: { images: { orderBy: { sortOrder: "asc" } } },
    take: 4,
  });
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Product Not Found" };

  return {
    title: product.seoTitle || product.name,
    description: product.seoDescription || product.shortDescription || product.description?.substring(0, 160),
    openGraph: {
      title: product.name,
      description: product.shortDescription || "",
      images: product.images[0]?.url ? [product.images[0].url] : [],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) notFound();

  const relatedProducts = await getRelatedProducts(product.categoryId, product.id);
  const discount = product.comparePrice
    ? getDiscountPercent(product.price, product.comparePrice)
    : 0;
  const specs = product.specifications
    ? JSON.parse(product.specifications)
    : {};

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gold/10 py-3 sm:py-3.5">
        <div className="container mx-auto px-4 lg:px-6">
          <nav className="flex flex-wrap items-center gap-1.5 text-xs text-gray" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-gold-dark transition-colors shrink-0">
              Home
            </Link>
            <ChevronRight size={12} className="shrink-0 text-gray/50" />
            <Link href="/products" className="hover:text-gold-dark transition-colors shrink-0">
              Products
            </Link>
            {product.category && (
              <>
                <ChevronRight size={12} className="shrink-0 text-gray/50" />
                {product.category.parent && (
                  <>
                    <Link
                      href={`/categories/${product.category.parent.slug}`}
                      className="hover:text-gold-dark transition-colors shrink-0"
                    >
                      {product.category.parent.name}
                    </Link>
                    <ChevronRight size={12} className="shrink-0 text-gray/50" />
                  </>
                )}
                <Link
                  href={`/categories/${product.category.slug}`}
                  className="hover:text-gold-dark transition-colors shrink-0"
                >
                  {product.category.name}
                </Link>
              </>
            )}
            <ChevronRight size={12} className="shrink-0 text-gray/50" />
            <span className="text-black font-medium truncate max-w-[180px] sm:max-w-xs">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      {/* Product Detail */}
      <section className="container mx-auto px-4 lg:px-6 py-6 sm:py-8 lg:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-14 xl:gap-16 items-start">
          {/* Interactive Image Gallery — Sticky on tablet/desktop */}
          <div className="md:sticky md:top-24 w-full">
            <ProductImageGallery
              images={product.images.map((img) => ({
                id: img.id,
                url: img.url,
                altText: img.altText,
                isPrimary: img.isPrimary,
              }))}
              productName={product.name}
              discount={discount}
              isNewArrival={product.isNewArrival}
            />
          </div>

          {/* Product Info */}
          <div className="w-full">
            {/* Category */}
            {product.category && (
              <Link
                href={`/categories/${product.category.slug}`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-gold-dark bg-gold/10 px-3 py-1 rounded-full mb-3 hover:bg-gold/20 transition-colors"
              >
                {product.category.name}
              </Link>
            )}

            <h1
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-black mb-2.5 sm:mb-3 leading-tight"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {product.name}
            </h1>

            {product.shortDescription && (
              <p className="text-xs sm:text-sm text-gray mb-4 leading-relaxed">{product.shortDescription}</p>
            )}

            {/* Price */}
            <div className="flex items-baseline flex-wrap gap-2.5 sm:gap-3 mb-5 sm:mb-6">
              <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-black">
                {formatPrice(product.price)}
              </span>
              {product.comparePrice && product.comparePrice > product.price && (
                <>
                  <span className="text-sm sm:text-base text-gray-light line-through">
                    MRP {formatPrice(product.comparePrice)}
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-success bg-success/10 px-2.5 py-0.5 rounded-full">
                    Save {formatPrice(product.comparePrice - product.price)}
                  </span>
                </>
              )}
            </div>

            {/* SKU */}
            {product.sku && (
              <p className="text-xs text-gray mb-4">
                Product ID: <span className="font-medium text-charcoal">{product.sku}</span>
              </p>
            )}

            {/* Info Badges — Responsive 3-column mini cards */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6">
              <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1 sm:gap-2 bg-cream rounded-xl p-2.5 sm:px-3 sm:py-2.5 text-[0.68rem] sm:text-xs font-medium text-charcoal text-center sm:text-left border border-gold/10">
                <Truck size={15} className="text-gold-dark shrink-0" />
                <span>Dispatch in {product.dispatchDays} day{product.dispatchDays !== 1 ? "s" : ""}</span>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1 sm:gap-2 bg-cream rounded-xl p-2.5 sm:px-3 sm:py-2.5 text-[0.68rem] sm:text-xs font-medium text-charcoal text-center sm:text-left border border-gold/10">
                <ShieldCheck size={15} className="text-gold-dark shrink-0" />
                <span>Quality Assured</span>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1 sm:gap-2 bg-cream rounded-xl p-2.5 sm:px-3 sm:py-2.5 text-[0.68rem] sm:text-xs font-medium text-charcoal text-center sm:text-left border border-gold/10">
                <Package size={15} className="text-gold-dark shrink-0" />
                <span>{product.stock > 0 ? `In Stock (${product.stock})` : "Out of Stock"}</span>
              </div>
            </div>

            {/* Buy Buttons */}
            <ProductActions product={{
              name: product.name,
              sku: product.sku,
              price: product.price,
            }} />

            {/* Divider */}
            <div className="border-t border-gold/10 my-6 sm:my-8" />

            {/* Description */}
            {product.description && (
              <div className="mb-6 sm:mb-8">
                <h3
                  className="text-base sm:text-lg font-semibold text-black mb-2.5 sm:mb-3"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  Description
                </h3>
                <p className="text-xs sm:text-sm text-gray leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            {/* Specifications */}
            {Object.keys(specs).length > 0 && (
              <div>
                <h3
                  className="text-base sm:text-lg font-semibold text-black mb-2.5 sm:mb-3"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  Specifications
                </h3>
                <div className="bg-cream rounded-xl overflow-hidden border border-gold/10">
                  {Object.entries(specs).map(([key, value], i) => (
                    <div
                      key={key}
                      className={`flex items-start px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm ${
                        i % 2 === 0 ? "bg-cream/70" : "bg-white"
                      }`}
                    >
                      <span className="font-medium text-charcoal w-28 sm:w-36 md:w-40 shrink-0">
                        {key}
                      </span>
                      <span className="text-gray break-words min-w-0 flex-1">{value as string}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="section-padding bg-white border-t border-gold/10">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="text-center mb-8 sm:mb-10">
              <p className="text-xs tracking-[0.3em] text-gold-dark uppercase mb-1.5 font-medium">
                You Might Also Like
              </p>
              <h2 className="heading-section text-2xl md:text-3xl mb-2.5">
                Related Products
              </h2>
              <div className="gold-divider gold-divider-center" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {relatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
