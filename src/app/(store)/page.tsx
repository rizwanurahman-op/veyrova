import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatPrice, getDiscountPercent } from "@/lib/utils";
import ProductCard from "@/components/store/ProductCard";
import HeroSection, { type HeroSlide } from "@/components/store/HeroSection";
import {
  ShoppingBag,
  Award,
  Truck,
  ShieldCheck,
  Gift,
  ArrowRight,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { InstagramIcon } from "@/components/icons";

export const metadata = {
  title: "VEYROVA — All Products. All For You. | Shop • Discover • Enjoy",
  description:
    "Welcome to VEYROVA, your premium destination for quality products. Explore phone cases, electronics, fashion, home & kitchen, beauty, fitness, and gifts. Best deals with fast delivery.",
};

async function getHomeData() {
  const [featuredProducts, newArrivals, bestSellers, categories, heroSetting] =
    await Promise.all([
      prisma.product.findMany({
        where: { status: "ACTIVE", isFeatured: true },
        include: { images: { orderBy: { sortOrder: "asc" } }, category: true },
        take: 8,
      }),
      prisma.product.findMany({
        where: { status: "ACTIVE", isNewArrival: true },
        include: { images: { orderBy: { sortOrder: "asc" } }, category: true },
        take: 8,
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.findMany({
        where: { status: "ACTIVE", isBestSeller: true },
        include: { images: { orderBy: { sortOrder: "asc" } }, category: true },
        take: 4,
      }),
      prisma.category.findMany({
        where: { parentId: null, status: "ACTIVE" },
        include: {
          children: { where: { status: "ACTIVE" }, orderBy: { sortOrder: "asc" } },
          _count: { select: { products: true } },
        },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.storeSetting.findUnique({ where: { key: "hero_slides" } }),
    ]);

  // Parse hero slides from DB — fall back to empty (HeroSection handles fallback)
  let heroSlides: HeroSlide[] = [];
  if (heroSetting?.value) {
    try {
      heroSlides = JSON.parse(heroSetting.value) as HeroSlide[];
    } catch {
      heroSlides = [];
    }
  }

  return { featuredProducts, newArrivals, bestSellers, categories, heroSlides };
}

// Category icon mapping
const categoryIcons: Record<string, React.ReactNode> = {
  electronics: <Sparkles size={28} />,
  fashion: <ShoppingBag size={28} />,
  "home-kitchen": <Gift size={28} />,
  "beauty-personal-care": <Award size={28} />,
  "fitness-sports": <ShieldCheck size={28} />,
  "gifts-accessories": <Gift size={28} />,
};

export default async function HomePage() {
  const { featuredProducts, newArrivals, bestSellers, categories, heroSlides } =
    await getHomeData();

  return (
    <div className="min-h-screen">
      {/* Hero Section — slides fetched server-side, no client flash */}
      <HeroSection initialSlides={heroSlides} />

      {/* Value Propositions */}
      <section className="py-10 bg-white border-b border-gold/10">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-4">
            {[
              { icon: <ShoppingBag size={24} />, title: "All Products", desc: "Wide range of categories" },
              { icon: <Award size={24} />, title: "Best Quality", desc: "Premium quality assured" },
              { icon: <Truck size={24} />, title: "Fast Delivery", desc: "Quick & safe shipping" },
              { icon: <ShieldCheck size={24} />, title: "Trusted Service", desc: "100% reliable service" },
              { icon: <Gift size={24} />, title: "Great Deals", desc: "Unbeatable prices" },
            ].map((item, i) => (
              <div
                key={i}
                className={`flex flex-col items-center text-center group cursor-default ${i === 4 ? "col-span-2 sm:col-span-1" : ""}`}
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-cream flex items-center justify-center text-gold-dark mb-2.5 sm:mb-3 group-hover:bg-gold group-hover:text-white transition-all duration-300 shadow-sm">
                  {item.icon}
                </div>
                <h3 className="text-xs sm:text-sm font-semibold text-black">{item.title}</h3>
                <p className="text-[0.7rem] sm:text-xs text-gray mt-0.5 hidden sm:block">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Shop by Category */}
      <section className="section-padding" id="categories-section">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs tracking-[0.3em] text-gold-dark uppercase mb-2 font-medium">
              Explore
            </p>
            <h2 className="heading-section text-3xl md:text-4xl mb-3">
              Shop by Category
            </h2>
            <div className="gold-divider gold-divider-center" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="group"
                id={`category-${cat.slug}`}
              >
                <div
                  className="bg-white rounded-2xl border border-gold/10 hover:border-gold/40 hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1"
                  style={{
                    minHeight: "220px",
                    padding: "2.5rem 1.5rem",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                  }}
                >
                  {/* Icon circle */}
                  <div
                    className="group-hover:bg-gold group-hover:text-white transition-all duration-300"
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "50%",
                      background: "var(--color-cream)",
                      boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--color-gold-dark)",
                      flexShrink: 0,
                      marginBottom: "1.25rem",
                    }}
                  >
                    {categoryIcons[cat.slug] || <ShoppingBag size={32} />}
                  </div>
                  {/* Name */}
                  <h3
                    className="group-hover:text-gold-dark transition-colors"
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: "1rem",
                      fontWeight: 700,
                      color: "var(--color-black)",
                      lineHeight: 1.3,
                      marginBottom: "0.375rem",
                    }}
                  >
                    {cat.name}
                  </h3>
                  {/* Subcategory count */}
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--color-gray-light)",
                    }}
                  >
                    {cat.children.length} subcategories
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="section-padding bg-white" id="featured-section">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-8 sm:mb-10">
              <div>
                <p className="text-xs tracking-[0.3em] text-gold-dark uppercase mb-2 font-medium">
                  Handpicked for You
                </p>
                <h2 className="heading-section text-2xl sm:text-3xl md:text-4xl">
                  Featured Products
                </h2>
                <div className="gold-divider mt-3" />
              </div>
              <Link
                href="/products?filter=featured"
                className="hidden sm:flex items-center gap-1 text-sm font-medium text-gold-dark hover:text-gold transition-colors"
              >
                View All <ArrowRight size={16} />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="text-center mt-6 sm:hidden">
              <Link href="/products?filter=featured" className="btn-outline text-xs py-2.5 px-5">
                View All Featured
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="section-padding" id="new-arrivals-section">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-8 sm:mb-10">
              <div>
                <p className="text-xs tracking-[0.3em] text-gold-dark uppercase mb-2 font-medium">
                  Just Dropped
                </p>
                <h2 className="heading-section text-2xl sm:text-3xl md:text-4xl">
                  New Arrivals
                </h2>
                <div className="gold-divider mt-3" />
              </div>
              <Link
                href="/products?filter=new"
                className="hidden sm:flex items-center gap-1 text-sm font-medium text-gold-dark hover:text-gold transition-colors"
              >
                View All <ArrowRight size={16} />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Banner - Shop on WhatsApp */}
      <section className="py-16 bg-black relative overflow-hidden" id="cta-section">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-gold rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gold rounded-full blur-[150px]" />
        </div>
        <div className="container mx-auto px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Shop Easily on{" "}
              <span className="gold-shimmer">WhatsApp</span>
            </h2>
            <p className="text-cream/70 text-lg mb-8 max-w-xl mx-auto">
              Found something you love? Simply tap &ldquo;Buy on WhatsApp&rdquo; and
              we&apos;ll take care of the rest. No sign-ups, no complications.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919876543210"}?text=${encodeURIComponent("Hi! I'm browsing your store and interested in your products.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp text-base px-8 py-4"
                id="cta-whatsapp"
              >
                <MessageCircle size={20} fill="white" />
                Chat with Us on WhatsApp
              </a>
              <a
                href={`https://instagram.com/${process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE || "veyrova.store_"}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-instagram text-base px-8 py-4"
                id="cta-instagram"
              >
                <InstagramIcon size={20} />
                Follow @veyrova.store_
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      {bestSellers.length > 0 && (
        <section className="section-padding bg-white" id="bestsellers-section">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-10">
              <p className="text-xs tracking-[0.3em] text-gold-dark uppercase mb-2 font-medium">
                Most Loved
              </p>
              <h2 className="heading-section text-2xl sm:text-3xl md:text-4xl mb-3">
                Best Sellers
              </h2>
              <div className="gold-divider gold-divider-center" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {bestSellers.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How to Order */}
      <section className="section-padding bg-cream" id="how-to-order">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs tracking-[0.3em] text-gold-dark uppercase mb-2 font-medium">
              Simple & Easy
            </p>
            <h2 className="heading-section text-3xl md:text-4xl mb-3">
              How to Order
            </h2>
            <div className="gold-divider gold-divider-center" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "01",
                title: "Browse & Select",
                desc: "Explore our wide range of products and find what you love.",
                icon: <ShoppingBag size={32} />,
              },
              {
                step: "02",
                title: "Click Buy on WhatsApp",
                desc: 'Tap the "Buy on WhatsApp" button with your selected product.',
                icon: <MessageCircle size={32} />,
              },
              {
                step: "03",
                title: "Confirm & Receive",
                desc: "Chat with us, confirm your order, and receive fast delivery!",
                icon: <Truck size={32} />,
              },
            ].map((item, i) => (
              <div key={i} className="text-center group">
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-white mx-auto flex items-center justify-center text-gold-dark shadow-lg group-hover:bg-gold group-hover:text-white transition-all duration-300">
                    {item.icon}
                  </div>
                  <span
                    className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gold text-white text-xs font-bold flex items-center justify-center"
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    {item.step}
                  </span>
                </div>
                <h3
                  className="text-lg font-semibold text-black mb-2"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  {item.title}
                </h3>
                <p className="text-sm text-gray">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Instagram CTA */}
      <section className="py-12 bg-white" id="instagram-section">
        <div className="container mx-auto px-6 lg:px-8 text-center">
          <p className="text-xs tracking-[0.3em] text-gold-dark uppercase mb-2 font-medium">
            Follow Us
          </p>
          <h2 className="heading-section text-2xl md:text-3xl mb-3">
            @veyrova.store_
          </h2>
          <p className="text-sm text-gray mb-6 max-w-md mx-auto">
            Follow us on Instagram for the latest products, exclusive deals, and
            styling inspiration.
          </p>
          <a
            href={`https://instagram.com/${process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE || "veyrova.store_"}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-instagram"
            id="instagram-follow"
          >
            <InstagramIcon size={18} />
            Follow on Instagram
          </a>
        </div>
      </section>
    </div>
  );
}
