import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react";
import DeleteProductButton from "@/components/admin/DeleteProductButton";

export const metadata = { title: "Products | VEYROVA Admin" };

async function getProducts() {
  return prisma.product.findMany({
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      category: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function AdminProductsPage() {
  const products = await getProducts();

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-black" style={{ fontFamily: "var(--font-serif)" }}>
            Products
          </h1>
          <p className="text-xs sm:text-sm text-gray mt-0.5">{products.length} products total</p>
        </div>
        <Link href="/admin/products/new" className="btn-gold !text-sm w-full sm:w-auto justify-center">
          <Plus size={16} /> Add Product
        </Link>
      </div>

      {/* Mobile Products List (Cards) - Shown on < sm */}
      <div className="sm:hidden space-y-3">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-xl border border-gold/10 p-3.5 shadow-xs"
          >
            <div className="flex items-start gap-3">
              <div className="w-14 h-14 rounded-lg bg-cream overflow-hidden shrink-0 border border-gray-lighter">
                {product.images[0] ? (
                  <img
                    src={product.images[0].url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                    No img
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-black truncate">{product.name}</p>
                <p className="text-xs text-gray truncate">
                  {product.category?.name || "Uncategorized"} • {product.sku || "No SKU"}
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-sm font-bold text-black">{formatPrice(product.price)}</span>
                  {product.comparePrice && (
                    <span className="text-xs text-gray-light line-through">
                      {formatPrice(product.comparePrice)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Row: Status, Stock & Actions */}
            <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-gray-lighter/60">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[0.65rem] font-semibold px-2 py-0.5 rounded-full ${
                    product.status === "ACTIVE"
                      ? "bg-green-50 text-green-700"
                      : product.status === "DRAFT"
                      ? "bg-yellow-50 text-yellow-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {product.status}
                </span>
                <span className={`text-xs font-medium ${product.stock > 0 ? "text-green-600" : "text-red-500"}`}>
                  {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <Link
                  href={`/products/${product.slug}`}
                  target="_blank"
                  className="p-2 rounded-lg text-gray hover:text-blue-600 hover:bg-blue-50 transition-all"
                  title="View"
                >
                  <Eye size={16} />
                </Link>
                <Link
                  href={`/admin/products/${product.id}`}
                  className="p-2 rounded-lg text-gray hover:text-gold-dark hover:bg-gold/10 transition-all"
                  title="Edit"
                >
                  <Edit size={16} />
                </Link>
                <DeleteProductButton productId={product.id} productName={product.name} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tablet & Desktop Products Table - Shown on >= sm */}
      <div className="hidden sm:block bg-white rounded-xl border border-gold/10 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-lighter bg-cream-light">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray uppercase tracking-wider">Product</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray uppercase tracking-wider hidden md:table-cell">Category</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray uppercase tracking-wider">Price</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray uppercase tracking-wider">Stock</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-gray-lighter/50 hover:bg-cream-light/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-cream overflow-hidden shrink-0 border border-gray-lighter">
                        {product.images[0] && (
                          <img
                            src={product.images[0].url}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="min-w-0 max-w-[220px]">
                        <p className="text-sm font-medium text-black truncate">{product.name}</p>
                        <p className="text-xs text-gray truncate">{product.sku || "No SKU"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-sm text-gray">{product.category?.name || "—"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <span className="text-sm font-semibold text-black">{formatPrice(product.price)}</span>
                      {product.comparePrice && (
                        <span className="block text-xs text-gray-light line-through">
                          {formatPrice(product.comparePrice)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-medium ${product.stock > 0 ? "text-green-600" : "text-red-500"}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        product.status === "ACTIVE"
                          ? "bg-green-50 text-green-700"
                          : product.status === "DRAFT"
                          ? "bg-yellow-50 text-yellow-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {product.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1 sm:gap-2">
                      <Link
                        href={`/products/${product.slug}`}
                        target="_blank"
                        className="p-1.5 rounded-lg text-gray hover:text-blue-600 hover:bg-blue-50 transition-all"
                        title="View"
                      >
                        <Eye size={15} />
                      </Link>
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="p-1.5 rounded-lg text-gray hover:text-gold-dark hover:bg-gold/10 transition-all"
                        title="Edit"
                      >
                        <Edit size={15} />
                      </Link>
                      <DeleteProductButton productId={product.id} productName={product.name} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {products.length === 0 && (
        <div className="bg-white rounded-xl border border-gold/10 text-center py-12 px-4 mt-4">
          <p className="text-gray mb-4">No products yet</p>
          <Link href="/admin/products/new" className="btn-gold !text-sm">
            <Plus size={16} /> Add Your First Product
          </Link>
        </div>
      )}
    </div>
  );
}
