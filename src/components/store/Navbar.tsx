"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Menu, X, ChevronDown } from "lucide-react";
import { WhatsAppIcon, InstagramIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

interface NavCategory {
  id: string;
  name: string;
  slug: string;
  children?: NavCategory[];
}

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<NavCategory[]>([]);
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const searchInputRef = useRef<HTMLInputElement>(null);
  const megaMenuTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch categories
  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => {
        if (d.categories) setCategories(d.categories);
      })
      .catch(() => {});
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  // Focus search input when opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
      setIsSearchOpen(false);
      setIsMobileMenuOpen(false);
      setSearchQuery("");
    }
  };

  const toggleCategory = (id: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleMegaEnter = (id: string) => {
    if (megaMenuTimeoutRef.current) clearTimeout(megaMenuTimeoutRef.current);
    setActiveMegaMenu(id);
  };

  const handleMegaLeave = () => {
    megaMenuTimeoutRef.current = setTimeout(() => setActiveMegaMenu(null), 180);
  };

  return (
    <>
      {/* ── Announcement Bar ── */}
      <div
        className="flex items-center justify-center text-cream-light bg-black py-1.5 px-3 sm:px-6"
        style={{
          fontSize: "0.68rem",
          letterSpacing: "0.12em",
          textAlign: "center",
        }}
      >
        <div className="flex items-center justify-center gap-2 sm:gap-3 font-medium truncate">
          <span className="text-gold opacity-80 shrink-0">✦</span>
          <span className="font-semibold tracking-wider whitespace-nowrap">FREE SHIPPING</span>
          <span className="opacity-35 hidden sm:inline">|</span>
          <span className="opacity-80 hidden sm:inline">Shop · Discover · Enjoy</span>
          <span className="opacity-35">|</span>
          <span className="font-semibold tracking-wider whitespace-nowrap text-gold">ORDER VIA WHATSAPP</span>
          <span className="text-gold opacity-80 shrink-0">✦</span>
        </div>
      </div>

      {/* ── Main Header ── */}
      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300",
          isScrolled
            ? "bg-white/96 backdrop-blur-md border-b border-gold/15 shadow-xs"
            : "bg-cream-light border-b border-gold/10"
        )}
      >
        <nav className="container mx-auto px-4 lg:px-8">
          <div
            className={cn(
              "flex items-center justify-between transition-all duration-300",
              isScrolled ? "h-14 sm:h-15 lg:h-[62px]" : "h-15 sm:h-16 lg:h-[74px]"
            )}
          >
            {/* Hamburger Button (Mobile / Tablet / lg) */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="xl:hidden p-2 -ml-2 text-black hover:text-gold-dark transition-colors rounded-lg active:scale-95"
              aria-label="Toggle menu"
              id="mobile-menu-toggle"
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* ── Logo ── */}
            <Link href="/" className="group flex-shrink-0" id="navbar-logo">
              <div className="flex flex-col items-center gap-0.5">
                <span
                  className="group-hover:text-gold-dark transition-colors duration-300 tracking-[0.22em] font-bold text-black text-xl sm:text-2xl lg:text-[1.55rem] leading-none"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  VEYROVA
                </span>
                <span className="hidden sm:block text-[0.55rem] tracking-[0.26em] text-gray-light uppercase leading-none font-medium">
                  All Products. All For You.
                </span>
              </div>
            </Link>

            {/* ── Desktop Nav ── */}
            <div className="hidden xl:flex items-center gap-4 2xl:gap-6">
              <NavLink href="/" active={pathname === "/"}>
                Home
              </NavLink>

              {categories.map((cat) => {
                const isCatActive = pathname.startsWith(`/categories/${cat.slug}`);
                return (
                  <div
                    key={cat.id}
                    className="relative"
                    onMouseEnter={() => handleMegaEnter(cat.id)}
                    onMouseLeave={handleMegaLeave}
                  >
                    <Link
                      href={`/categories/${cat.slug}`}
                      className={cn(
                        "hover:text-gold-dark transition-colors duration-200 flex items-center gap-1 text-[0.82rem] font-medium whitespace-nowrap py-1",
                        isCatActive ? "text-gold-dark font-semibold" : "text-charcoal"
                      )}
                    >
                      {cat.name}
                      {cat.children && cat.children.length > 0 && (
                        <ChevronDown
                          size={13}
                          className={cn(
                            "opacity-50 transition-transform duration-200 shrink-0",
                            activeMegaMenu === cat.id ? "rotate-180" : "rotate-0"
                          )}
                        />
                      )}
                    </Link>

                    {cat.children && cat.children.length > 0 && activeMegaMenu === cat.id && (
                      <div
                        className="absolute top-full left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-xl p-2 border border-gold/15 min-w-[190px] animate-in fade-in slide-in-from-top-1 duration-150 z-50"
                        onMouseEnter={() => handleMegaEnter(cat.id)}
                        onMouseLeave={handleMegaLeave}
                      >
                        <Link
                          href={`/categories/${cat.slug}`}
                          className="block px-3.5 py-2 text-xs font-semibold text-gold-dark hover:bg-cream-light rounded-lg transition-all"
                        >
                          All {cat.name} →
                        </Link>
                        <div className="my-1 border-t border-gold/10" />
                        {cat.children.map((sub) => (
                          <Link
                            key={sub.id}
                            href={`/categories/${sub.slug}`}
                            className={cn(
                              "block px-3.5 py-2 text-xs rounded-lg transition-all duration-150 whitespace-nowrap",
                              pathname === `/categories/${sub.slug}`
                                ? "bg-gold/10 text-gold-dark font-semibold"
                                : "text-charcoal hover:bg-cream-light hover:text-gold-dark"
                            )}
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              <NavLink href="/products" active={pathname === "/products"}>
                All Products
              </NavLink>
            </div>

            {/* ── Right Actions ── */}
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 text-charcoal hover:text-gold-dark transition-colors duration-200 rounded-full active:scale-95"
                aria-label="Search"
                id="search-toggle"
              >
                <Search size={19} />
              </button>

              {/* Mobile: WhatsApp icon only */}
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919876543210"}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Contact on WhatsApp"
                className="p-2 text-[#25D366] hover:opacity-85 transition-opacity xl:hidden active:scale-95"
                id="mobile-navbar-whatsapp"
              >
                <WhatsAppIcon size={20} />
              </a>

              {/* Desktop "Contact Us" pill */}
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919876543210"}`}
                target="_blank"
                rel="noopener noreferrer"
                id="navbar-whatsapp"
                className="hidden xl:flex items-center gap-1.5 bg-black hover:bg-charcoal text-cream-light text-xs font-medium px-4 py-2 rounded-full transition-colors whitespace-nowrap active:scale-95 shadow-xs"
              >
                <WhatsAppIcon size={14} />
                <span>Contact Us</span>
              </a>
            </div>
          </div>
        </nav>

        {/* ── Search Dropdown ── */}
        <div
          className={cn(
            "overflow-hidden transition-all duration-300 bg-white border-t border-gold/10",
            isSearchOpen ? "max-h-20 py-2.5 sm:py-3 shadow-xs" : "max-h-0 py-0"
          )}
        >
          <div className="container mx-auto px-4 lg:px-8">
            <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-lg mx-auto">
              <div className="flex-1 relative">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products, categories..."
                  id="search-input"
                  className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-cream-light border border-gold/20 rounded-full outline-none text-black placeholder:text-gray-400 focus:ring-2 focus:ring-gold/25"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black p-1"
                    aria-label="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <button
                type="submit"
                id="search-submit"
                className="bg-gold-dark hover:bg-gold text-white font-semibold text-xs sm:text-sm px-4 sm:px-5 py-2 rounded-full transition-colors shrink-0 active:scale-95 shadow-xs"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* ── Mobile Slide-Over Drawer ── */}
      <div
        className={cn(
          "fixed inset-0 z-60 lg:hidden transition-all duration-300",
          isMobileMenuOpen ? "pointer-events-auto visible" : "pointer-events-none invisible"
        )}
      >
        {/* Backdrop */}
        <div
          className={cn(
            "absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300 ease-out",
            isMobileMenuOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Drawer Panel */}
        <div
          className={cn(
            "absolute left-0 top-0 h-full w-[85vw] max-w-[340px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out",
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 flex items-center justify-between border-b border-gold/10 bg-cream/30">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex flex-col"
            >
              <span
                className="tracking-[0.22em] font-bold text-black text-lg"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                VEYROVA
              </span>
              <span className="text-[0.52rem] tracking-[0.24em] text-gray-light uppercase">
                Luxury Collection
              </span>
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 -mr-1 rounded-full text-black hover:bg-black/5 transition-colors active:scale-95"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          {/* Quick Search inside Drawer */}
          <div className="p-3.5 border-b border-gold/10 bg-white">
            <form onSubmit={handleSearch} className="relative">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-cream-light border border-gold/20 rounded-full text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/25"
              />
            </form>
          </div>

          {/* Navigation Links (Scrollable with accordions) */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-3 sm:p-4 space-y-1">
            <MobileLink
              href="/"
              active={pathname === "/"}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </MobileLink>

            <MobileLink
              href="/products"
              active={pathname === "/products"}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              All Products
            </MobileLink>

            <div className="pt-3 pb-1.5 px-3 text-[0.65rem] tracking-[0.2em] uppercase font-semibold text-gold-dark">
              Categories
            </div>

            {categories.map((cat) => {
              const hasChildren = cat.children && cat.children.length > 0;
              const isExpanded = !!expandedCategories[cat.id];
              const isCatActive = pathname.startsWith(`/categories/${cat.slug}`);

              return (
                <div key={cat.id} className="rounded-xl overflow-hidden">
                  <div
                    className={cn(
                      "flex items-center justify-between transition-colors rounded-xl",
                      isCatActive ? "bg-gold/10" : "hover:bg-cream-light"
                    )}
                  >
                    <Link
                      href={`/categories/${cat.slug}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex-1 py-2.5 px-3 text-sm font-medium transition-colors",
                        isCatActive ? "text-gold-dark font-semibold" : "text-charcoal"
                      )}
                    >
                      {cat.name}
                    </Link>

                    {hasChildren && (
                      <button
                        onClick={() => toggleCategory(cat.id)}
                        className="p-2.5 text-gray-400 hover:text-gold-dark transition-colors"
                        aria-label={`Toggle ${cat.name} subcategories`}
                      >
                        <ChevronDown
                          size={16}
                          className={cn(
                            "transition-transform duration-200",
                            isExpanded ? "rotate-180 text-gold-dark" : "rotate-0"
                          )}
                        />
                      </button>
                    )}
                  </div>

                  {/* Collapsible Subcategories */}
                  {hasChildren && isExpanded && (
                    <div className="pl-3.5 pr-1 py-1 space-y-0.5 border-l-2 border-gold/25 ml-4 mt-1 mb-1 animate-in fade-in duration-200">
                      <Link
                        href={`/categories/${cat.slug}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block py-1.5 px-2.5 text-xs font-semibold text-gold-dark hover:bg-cream-light rounded-lg"
                      >
                        All {cat.name} →
                      </Link>
                      {cat.children!.map((sub) => {
                        const isSubActive = pathname === `/categories/${sub.slug}`;
                        return (
                          <Link
                            key={sub.id}
                            href={`/categories/${sub.slug}`}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={cn(
                              "block py-1.5 px-2.5 text-xs rounded-lg transition-colors",
                              isSubActive
                                ? "text-gold-dark font-semibold bg-gold/10"
                                : "text-gray hover:text-charcoal hover:bg-cream-light"
                            )}
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

          {/* Drawer Footer Actions */}
          <div className="p-4 border-t border-gold/15 bg-cream/30 space-y-2.5">
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919876543210"}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp w-full text-xs sm:text-sm py-2.5 rounded-xl justify-center font-medium shadow-xs"
            >
              <WhatsAppIcon size={16} />
              <span>Shop on WhatsApp</span>
            </a>

            <a
              href={`https://instagram.com/${process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE || "veyrova.store_"}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-instagram w-full text-xs sm:text-sm py-2.5 rounded-xl justify-center font-medium shadow-xs"
            >
              <InstagramIcon size={16} />
              <span>Follow on Instagram</span>
            </a>

            <p className="text-center text-[0.62rem] text-gray-400 tracking-wider pt-1">
              VEYROVA · ALL PRODUCTS. ALL FOR YOU.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Small helper components ── */
function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "hover:text-gold-dark transition-colors duration-200 text-[0.82rem] font-medium whitespace-nowrap py-1 relative",
        active ? "text-gold-dark font-semibold" : "text-charcoal"
      )}
    >
      {children}
      {active && (
        <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gold rounded-full" />
      )}
    </Link>
  );
}

function MobileLink({
  href,
  active,
  onClick,
  children,
}: {
  href: string;
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "block py-2.5 px-3 text-sm font-medium rounded-xl transition-all",
        active
          ? "bg-gold/10 text-gold-dark font-semibold"
          : "text-black hover:bg-cream-light hover:text-gold-dark"
      )}
    >
      {children}
    </Link>
  );
}
