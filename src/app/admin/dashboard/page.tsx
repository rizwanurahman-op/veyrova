import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Package,
  FolderTree,
  ShoppingCart,
  TrendingUp,
  MessageCircle,
  Plus,
  ArrowRight,
  Clock,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

export const metadata = {
  title: "Dashboard | VEYROVA Admin",
};

async function getDashboardData() {
  const [
    totalProducts,
    activeProducts,
    totalCategories,
    totalOrders,
    newOrders,
    recentOrders,
    recentProducts,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { status: "ACTIVE" } }),
    prisma.category.count(),
    prisma.orderEnquiry.count(),
    prisma.orderEnquiry.count({ where: { status: "NEW" } }),
    prisma.orderEnquiry.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { items: { include: { product: true } } },
    }),
    prisma.product.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { images: true, category: true },
    }),
  ]);

  return {
    totalProducts,
    activeProducts,
    totalCategories,
    totalOrders,
    newOrders,
    recentOrders,
    recentProducts,
  };
}

export default async function AdminDashboard() {
  const data = await getDashboardData();

  const stats = [
    {
      label: "Total Products",
      value: data.totalProducts,
      icon: Package,
      color: "text-blue-600",
      bg: "bg-blue-50",
      href: "/admin/products",
    },
    {
      label: "Active Products",
      value: data.activeProducts,
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-50",
      href: "/admin/products",
    },
    {
      label: "Categories",
      value: data.totalCategories,
      icon: FolderTree,
      color: "text-purple-600",
      bg: "bg-purple-50",
      href: "/admin/categories",
    },
    {
      label: "Total Orders",
      value: data.totalOrders,
      icon: ShoppingCart,
      color: "text-orange-600",
      bg: "bg-orange-50",
      href: "/admin/orders",
    },
    {
      label: "New Enquiries",
      value: data.newOrders,
      icon: MessageCircle,
      color: "text-gold-dark",
      bg: "bg-gold/10",
      href: "/admin/orders",
    },
  ];

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1
          className="text-2xl md:text-3xl font-bold text-black"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Dashboard
        </h1>
        <p className="text-xs sm:text-sm text-gray mt-1">
          Welcome back! Here&apos;s an overview of your store.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4 mb-6 sm:mb-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Link
              key={i}
              href={stat.href}
              className="admin-stat-card group cursor-pointer"
            >
              <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-2.5 sm:mb-3`}>
                <Icon size={18} className={`${stat.color} sm:w-5 sm:h-5`} />
              </div>
              <p className="text-xl sm:text-2xl font-bold text-black">{stat.value}</p>
              <p className="text-[0.7rem] sm:text-xs text-gray mt-1 truncate">{stat.label}</p>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <Link
          href="/admin/products/new"
          className="flex items-center gap-3 bg-gold text-white p-3.5 sm:p-4 rounded-xl hover:bg-gold-dark transition-all group shadow-xs hover:shadow-sm"
        >
          <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
            <Plus size={20} />
          </div>
          <div>
            <p className="font-semibold text-sm">Add New Product</p>
            <p className="text-xs text-white/70">Create a new product listing</p>
          </div>
          <ArrowRight size={16} className="ml-auto group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          href="/admin/categories"
          className="flex items-center gap-3 bg-white p-4 rounded-xl border border-gold/10 hover:border-gold/30 hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
            <FolderTree size={20} className="text-purple-600" />
          </div>
          <div>
            <p className="font-semibold text-sm text-black">Manage Categories</p>
            <p className="text-xs text-gray">Add or edit categories</p>
          </div>
          <ArrowRight size={16} className="ml-auto text-gray group-hover:text-gold-dark group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          href="/admin/orders"
          className="flex items-center gap-3 bg-white p-4 rounded-xl border border-gold/10 hover:border-gold/30 hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
            <ShoppingCart size={20} className="text-orange-600" />
          </div>
          <div>
            <p className="font-semibold text-sm text-black">View Orders</p>
            <p className="text-xs text-gray">Manage enquiries & leads</p>
          </div>
          <ArrowRight size={16} className="ml-auto text-gray group-hover:text-gold-dark group-hover:translate-x-1 transition-all" />
        </Link>
      </div>

      {/* Recent Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Products */}
        <div className="bg-white rounded-xl border border-gold/10 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-black" style={{ fontFamily: "var(--font-serif)" }}>
              Recent Products
            </h3>
            <Link href="/admin/products" className="text-xs text-gold-dark hover:text-gold transition-colors font-medium">
              View All →
            </Link>
          </div>
          <div className="space-y-2.5">
            {data.recentProducts.length > 0 ? (
              data.recentProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/admin/products/${product.id}`}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-cream-light transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-cream overflow-hidden shrink-0 border border-gray-lighter">
                    {product.images[0] && (
                      <img
                        src={product.images[0].url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-black truncate">{product.name}</p>
                    <p className="text-xs text-gray truncate">{product.category?.name || "Uncategorized"}</p>
                  </div>
                  <span className="text-sm font-semibold text-black shrink-0">
                    {formatPrice(product.price)}
                  </span>
                </Link>
              ))
            ) : (
              <p className="text-sm text-gray text-center py-4">No products yet</p>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-gold/10 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-black" style={{ fontFamily: "var(--font-serif)" }}>
              Recent Enquiries
            </h3>
            <Link href="/admin/orders" className="text-xs text-gold-dark hover:text-gold transition-colors font-medium">
              View All →
            </Link>
          </div>
          <div className="space-y-3">
            {data.recentOrders.length > 0 ? (
              data.recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href="/admin/orders"
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-cream-light transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-cream flex items-center justify-center shrink-0">
                    <Clock size={16} className="text-gold-dark" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-black">{order.orderNumber}</p>
                    <p className="text-xs text-gray">{order.source} • {order.status}</p>
                  </div>
                  <span className="text-sm font-semibold text-black shrink-0">
                    {formatPrice(order.totalAmount)}
                  </span>
                </Link>
              ))
            ) : (
              <p className="text-sm text-gray text-center py-4">No orders yet. Orders will appear here when customers contact you via WhatsApp or Instagram.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
