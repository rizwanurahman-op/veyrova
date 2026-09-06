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
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-black" style={{ fontFamily: "var(--font-serif)" }}>
            Products
          </h1>
          <p className="text-sm text-gray mt-1">{products.length} products total</p>
        </div>
        <Link href="/admin/products/new" className="btn-gold !text-sm">
          <Plus size={16} /> Add Product
        </Link>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-gold/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-lighter bg-cream-light">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray uppercase tracking-wider">Product</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray uppercase tracking-wider hidden md:table-cell">Category</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray uppercase tracking-wider">Price</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray uppercase tracking-wider hidden sm:table-cell">Stock</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray uppercase tracking-wider hidden sm:table-cell">Status</th>
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
                      <div className="w-10 h-10 rounded-lg bg-cream overflow-hidden shrink-0">
                        {product.images[0] && (
                          <img
                            src={product.images[0].url}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-black truncate max-w-[200px]">{product.name}</p>
                        <p className="text-xs text-gray">{product.sku || "No SKU"}</p>
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
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className={`text-sm font-medium ${product.stock > 0 ? "text-green-600" : "text-red-500"}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
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
                    <div className="flex items-center justify-end gap-2">
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

        {products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray mb-4">No products yet</p>
            <Link href="/admin/products/new" className="btn-gold !text-sm">
              <Plus size={16} /> Add Your First Product
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
