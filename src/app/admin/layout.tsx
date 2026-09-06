"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  LayoutTemplate,
} from "lucide-react";
import { signOut } from "next-auth/react";

const sidebarLinks = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/orders", label: "Orders / Leads", icon: ShoppingCart },
  { href: "/admin/hero", label: "Hero Slides", icon: LayoutTemplate },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const getPageTitle = (path: string) => {
    if (path.startsWith("/admin/products/new")) return "Add New Product";
    if (path.startsWith("/admin/products/") && path !== "/admin/products") return "Edit Product";
    if (path.startsWith("/admin/products")) return "Products";
    if (path.startsWith("/admin/categories")) return "Categories";
    if (path.startsWith("/admin/orders")) return "Orders & Enquiries";
    if (path.startsWith("/admin/hero")) return "Hero Slides";
    if (path.startsWith("/admin/settings")) return "Settings";
    return "Dashboard";
  };

  const pageTitle = getPageTitle(pathname);

  return (
    <div className="min-h-screen bg-cream-light">
      {/* Fixed Admin Top Navbar (Always pinned for mobile, tablet, and desktop) */}
      <header className="fixed top-0 left-0 lg:left-[270px] right-0 h-14 sm:h-16 bg-white/95 backdrop-blur-md border-b border-gray-lighter shadow-2xs flex items-center justify-between px-3.5 sm:px-6 lg:px-8 z-30 transition-all">
        {/* Left: Hamburger (mobile/tablet) & Brand or Breadcrumb (desktop) */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 -ml-1 bg-cream-light rounded-xl border border-gold/15 text-charcoal hover:text-gold-dark transition-colors focus:outline-none focus:ring-2 focus:ring-gold/30"
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>

          {/* Mobile Brand Title */}
          <div className="flex items-center gap-1.5 lg:hidden">
            <span
              className="text-base font-bold tracking-[0.15em] text-black"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              VEYROVA
            </span>
            <span className="text-[0.6rem] uppercase tracking-wider bg-gold/15 text-gold-dark font-bold px-1.5 py-0.5 rounded">
              Admin
            </span>
          </div>

          {/* Desktop Breadcrumb Navigation */}
          <div className="hidden lg:flex items-center gap-2 text-xs">
            <span className="text-gray-400 font-medium">Admin</span>
            <span className="text-gray-300">/</span>
            <span className="text-charcoal font-semibold text-sm">{pageTitle}</span>
          </div>
        </div>

        {/* Right: Store Link & Sign Out */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-charcoal hover:text-gold-dark bg-cream-light/80 hover:bg-cream-light border border-gold/10 rounded-lg transition-all"
            title="View Store"
          >
            <Package size={15} />
            <span className="hidden sm:inline">View Store</span>
          </Link>

          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-lg transition-all cursor-pointer"
            title="Sign Out"
          >
            <LogOut size={15} />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`admin-sidebar ${sidebarOpen ? "open" : ""} flex flex-col`}
        aria-label="Admin navigation sidebar"
      >
        {/* Logo & Mobile Close */}
        <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-white/10 flex items-center justify-between">
          <div>
            <Link
              href="/admin/dashboard"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3"
            >
              <span
                className="text-xl font-bold tracking-[0.2em] text-white"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                VEYROVA
              </span>
            </Link>
            <p className="text-[0.65rem] tracking-[0.15em] text-gold mt-0.5 uppercase font-medium">
              Admin Dashboard
            </p>
          </div>

          {/* Close button inside sidebar on mobile/tablet */}
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-gray-light hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {sidebarLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-gold/20 text-gold shadow-sm font-semibold"
                    : "text-gray-light hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={18} className="shrink-0" />
                <span className="truncate">{link.label}</span>
                {isActive && (
                  <ChevronRight size={14} className="ml-auto shrink-0" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="px-3 py-3 sm:py-4 border-t border-white/10 space-y-1">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-3.5 py-2.5 text-sm text-gray-light hover:text-white hover:bg-white/5 rounded-xl transition-all"
          >
            <Package size={16} className="shrink-0" />
            <span>View Store</span>
          </Link>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="flex items-center gap-3 px-3.5 py-2.5 text-sm text-gray-light hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all w-full text-left cursor-pointer"
          >
            <LogOut size={16} className="shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="admin-content">
        <main className="w-full max-w-7xl mx-auto min-w-0">
          {children}
        </main>
      </div>

      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
