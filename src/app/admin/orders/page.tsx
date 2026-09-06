"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ShoppingCart,
  Plus,
  X,
  MessageCircle,
  Camera,
  ChevronDown,
  Trash2,
  RefreshCw,
  Search,
  User,
  Phone,
  MapPin,
  FileText,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────
interface ProductItem {
  id: string;
  name: string;
  price: number;
  sku?: string;
  images: { url: string; isPrimary: boolean }[];
}

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: ProductItem;
}

interface Order {
  id: string;
  orderNumber: string;
  source: string;
  status: string;
  totalAmount: number;
  customerName: string | null;
  customerPhone: string | null;
  customerEmail: string | null;
  customerAddress: string | null;
  notes: string | null;
  createdAt: string;
  items: OrderItem[];
}

// ── Status config ──────────────────────────────────────────────────────────
const STATUS_FLOW = [
  "NEW",
  "CONTACTED",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

const STATUS_STYLES: Record<string, string> = {
  NEW: "bg-blue-50 text-blue-700 border-blue-200",
  CONTACTED: "bg-yellow-50 text-yellow-700 border-yellow-200",
  CONFIRMED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PROCESSING: "bg-orange-50 text-orange-700 border-orange-200",
  SHIPPED: "bg-purple-50 text-purple-700 border-purple-200",
  DELIVERED: "bg-green-50 text-green-700 border-green-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
};

// ── Helpers ────────────────────────────────────────────────────────────────
function formatPrice(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

function formatDate(s: string) {
  return new Date(s).toLocaleDateString("en-IN", { dateStyle: "medium" });
}

// ── Create Order Modal ─────────────────────────────────────────────────────
interface ModalProps {
  products: ProductItem[];
  onClose: () => void;
  onCreated: (order: Order) => void;
}

function CreateOrderModal({ products, onClose, onCreated }: ModalProps) {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [source, setSource] = useState<"WHATSAPP" | "INSTAGRAM">("WHATSAPP");
  const [selectedItems, setSelectedItems] = useState<
    { productId: string; quantity: number; price: number; name: string }[]
  >([]);
  const [productSearch, setProductSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  function addProduct(p: ProductItem) {
    if (selectedItems.find((i) => i.productId === p.id)) return;
    setSelectedItems((prev) => [
      ...prev,
      { productId: p.id, quantity: 1, price: p.price, name: p.name },
    ]);
    setProductSearch("");
  }

  function removeItem(productId: string) {
    setSelectedItems((prev) => prev.filter((i) => i.productId !== productId));
  }

  function updateQty(productId: string, qty: number) {
    if (qty < 1) return;
    setSelectedItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, quantity: qty } : i))
    );
  }

  const total = selectedItems.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selectedItems.length === 0) {
      setError("Add at least one product");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerPhone,
          customerEmail,
          customerAddress,
          notes,
          source,
          items: selectedItems,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const { order } = await res.json();
      onCreated(order);
    } catch {
      setError("Failed to create order. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div>
            <h2
              className="text-base sm:text-lg font-bold text-black"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Log WhatsApp Order
            </h2>
            <p className="text-[0.7rem] sm:text-xs text-gray-500 mt-0.5">
              Manually record a confirmed order
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Source */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
              Order Source
            </label>
            <div className="flex gap-2 sm:gap-3">
              {(["WHATSAPP", "INSTAGRAM"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSource(s)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border text-xs sm:text-sm font-medium transition-all ${
                    source === s
                      ? s === "WHATSAPP"
                        ? "bg-[#25D366] text-white border-[#25D366]"
                        : "bg-gradient-to-r from-purple-600 to-pink-500 text-white border-transparent"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {s === "WHATSAPP" ? (
                    <MessageCircle size={15} />
                  ) : (
                    <Camera size={15} />
                  )}
                  {s.charAt(0) + s.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Customer Info */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5 block">
              Customer Info
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Customer name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/10 transition-all"
                />
              </div>
              <div className="relative">
                <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  placeholder="Phone number"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/10 transition-all"
                />
              </div>
              <div className="relative sm:col-span-2">
                <MapPin size={14} className="absolute left-3 top-3 text-gray-400" />
                <textarea
                  placeholder="Delivery address"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  rows={2}
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/10 transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Products */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 block">
              Products
            </label>

            {/* Product search */}
            <div className="relative mb-3">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search and add products…"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/10 transition-all"
              />
              {/* Dropdown */}
              {productSearch && filteredProducts.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 max-h-48 overflow-y-auto">
                  {filteredProducts.slice(0, 6).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => addProduct(p)}
                      disabled={!!selectedItems.find((i) => i.productId === p.id)}
                      className="w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                        {p.images[0] && (
                          <img
                            src={p.images[0].url}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-black truncate">{p.name}</p>
                        <p className="text-xs text-gray-500">{formatPrice(p.price)}</p>
                      </div>
                      <Plus size={14} className="text-gray-400 shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected items */}
            {selectedItems.length > 0 ? (
              <div className="space-y-2">
                {selectedItems.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-black truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">{formatPrice(item.price)} each</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateQty(item.productId, item.quantity - 1)}
                        className="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:border-gray-400 transition-colors text-xs font-bold"
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQty(item.productId, item.quantity + 1)}
                        className="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:border-gray-400 transition-colors text-xs font-bold"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-sm font-semibold text-black min-w-[64px] text-right">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      className="w-6 h-6 text-red-400 hover:text-red-600 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}

                {/* Total */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-200 mt-2">
                  <span className="text-sm text-gray-500">Total</span>
                  <span className="text-lg font-bold text-black">{formatPrice(total)}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-xl">
                <p className="text-sm text-gray-400">Search and add products above</p>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
              Notes (optional)
            </label>
            <div className="relative">
              <FileText size={14} className="absolute left-3 top-3 text-gray-400" />
              <textarea
                placeholder="Any special instructions or notes from the customer…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/10 transition-all resize-none"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
              {error}
            </p>
          )}

          {/* Submit */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60"
              style={{ background: "var(--color-gold-dark)" }}
            >
              {saving ? "Saving…" : "Create Order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Status Dropdown ─────────────────────────────────────────────────────────
function StatusDropdown({
  order,
  onUpdated,
}: {
  order: Order;
  onUpdated: (updated: Order) => void;
}) {
  const [open, setOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  async function changeStatus(status: string) {
    setOpen(false);
    if (status === order.status) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      const { order: updated } = await res.json();
      onUpdated(updated);
    } catch {
      // silent fail — page will still show old status
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={updating}
        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${STATUS_STYLES[order.status] || "bg-gray-50 text-gray-600 border-gray-200"} ${updating ? "opacity-60" : "hover:shadow-sm"}`}
      >
        {updating ? (
          <RefreshCw size={10} className="animate-spin" />
        ) : null}
        {order.status}
        <ChevronDown size={12} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1.5 bg-white rounded-xl border border-gray-100 shadow-xl z-20 overflow-hidden min-w-[160px]">
            {STATUS_FLOW.map((s) => (
              <button
                key={s}
                onClick={() => changeStatus(s)}
                className={`w-full text-left px-4 py-2 text-xs font-medium transition-colors hover:bg-gray-50 ${s === order.status ? "bg-gray-50 font-bold" : ""}`}
              >
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full ${STATUS_STYLES[s]}`}>
                  {s}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      setOrders(data.orders || []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
    // Load products for the create order modal
    fetch("/api/products?limit=100")
      .then((r) => r.json())
      .then((d) => setProducts(d.products || []));
  }, [loadOrders]);

  function handleCreated(order: Order) {
    setOrders((prev) => [order, ...prev]);
    setShowModal(false);
  }

  function handleUpdated(updated: Order) {
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this order?")) return;
    try {
      await fetch(`/api/admin/orders/${id}`, { method: "DELETE" });
      setOrders((prev) => prev.filter((o) => o.id !== id));
    } catch {
      alert("Failed to delete order");
    }
  }

  // Filtered orders
  const filtered = orders.filter((o) => {
    const matchesStatus = filterStatus === "ALL" || o.status === filterStatus;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      o.orderNumber.toLowerCase().includes(q) ||
      (o.customerName || "").toLowerCase().includes(q) ||
      (o.customerPhone || "").includes(q);
    return matchesStatus && matchesSearch;
  });

  // Summary counts
  const counts = STATUS_FLOW.reduce(
    (acc, s) => {
      acc[s] = orders.filter((o) => o.status === s).length;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="w-full">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1
            className="text-2xl font-bold text-black"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Orders & Enquiries
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Log and track WhatsApp & Instagram orders
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-xs hover:shadow-md transition-all w-full sm:w-auto"
          style={{ background: "var(--color-gold-dark)" }}
          id="create-order-btn"
        >
          <Plus size={16} />
          Log Order
        </button>
      </div>

      {/* Summary strip */}
      {orders.length > 0 && (
        <div className="grid grid-cols-2 xs:grid-cols-4 sm:grid-cols-4 lg:grid-cols-7 gap-2 mb-6">
          {[
            { label: "Total", count: orders.length, style: "bg-white border border-gray-200 text-charcoal" },
            { label: "New", count: counts.NEW, style: "bg-blue-50 text-blue-700 border border-blue-100" },
            { label: "Confirmed", count: counts.CONFIRMED, style: "bg-emerald-50 text-emerald-700 border border-emerald-100" },
            { label: "Shipped", count: counts.SHIPPED, style: "bg-purple-50 text-purple-700 border border-purple-100" },
            { label: "Delivered", count: counts.DELIVERED, style: "bg-green-50 text-green-700 border border-green-100" },
            { label: "Processing", count: counts.PROCESSING, style: "bg-orange-50 text-orange-700 border border-orange-100" },
            { label: "Cancelled", count: counts.CANCELLED, style: "bg-red-50 text-red-700 border border-red-100" },
          ].map((s) => (
            <div
              key={s.label}
              className={`rounded-xl px-2 py-2 sm:px-3 sm:py-2 text-center shadow-2xs ${s.style}`}
            >
              <p className="text-base sm:text-lg font-bold">{s.count}</p>
              <p className="text-[0.65rem] sm:text-xs opacity-75 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      {orders.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 mb-5">
          <div className="relative flex-1 min-w-0">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, phone or order no…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/10 transition-all bg-white"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-yellow-500 transition-all"
          >
            <option value="ALL">All Status</option>
            {STATUS_FLOW.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      )}

      {/* Orders list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw size={24} className="animate-spin text-gray-300" />
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-3 sm:space-y-4">
          {filtered.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-shadow p-3.5 sm:p-5"
            >
              {/* Top row */}
              <div className="flex flex-wrap sm:flex-nowrap items-start justify-between gap-2.5 mb-3 sm:mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      order.source === "WHATSAPP"
                        ? "bg-[#25D366]/10"
                        : "bg-purple-50"
                    }`}
                  >
                    {order.source === "WHATSAPP" ? (
                      <MessageCircle size={16} className="text-[#25D366]" />
                    ) : (
                      <Camera size={16} className="text-purple-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-black text-sm">{order.orderNumber}</p>
                    <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusDropdown order={order} onUpdated={handleUpdated} />
                  <button
                    onClick={() => handleDelete(order.id)}
                    className="w-7 h-7 rounded-lg bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-100 hover:text-red-600 transition-colors"
                    title="Delete order"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Customer + Items side by side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Customer */}
                <div className="bg-gray-50 rounded-xl p-3 text-sm space-y-1">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Customer</p>
                  <p className="font-semibold text-black">{order.customerName || "—"}</p>
                  {order.customerPhone && (
                    <p className="text-gray-500 flex items-center gap-1.5">
                      <Phone size={11} /> {order.customerPhone}
                    </p>
                  )}
                  {order.customerAddress && (
                    <p className="text-gray-500 flex items-center gap-1.5 text-xs">
                      <MapPin size={11} className="shrink-0" /> {order.customerAddress}
                    </p>
                  )}
                  {order.notes && (
                    <p className="text-gray-400 text-xs italic border-t border-gray-200 pt-1 mt-1">
                      {order.notes}
                    </p>
                  )}
                </div>

                {/* Items */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Items</p>
                  {order.items.length > 0 ? (
                    order.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                          {item.product.images[0] && (
                            <img
                              src={item.product.images[0].url}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <p className="text-sm text-gray-700 flex-1 truncate">{item.product.name}</p>
                        <span className="text-xs text-gray-400">×{item.quantity}</span>
                        <span className="text-sm font-semibold text-black">{formatPrice(item.price)}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400 italic">No items logged</p>
                  )}
                </div>
              </div>

              {/* Total */}
              <div className="flex items-center justify-end mt-4 pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-400 mr-2">Order Total</span>
                <span className="text-lg font-bold text-black">{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
            <ShoppingCart size={28} className="text-gray-300" />
          </div>
          <h3
            className="text-lg font-semibold text-gray-700 mb-2"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {search || filterStatus !== "ALL" ? "No matching orders" : "No orders yet"}
          </h3>
          <p className="text-sm text-gray-400 max-w-sm mx-auto mb-6">
            {search || filterStatus !== "ALL"
              ? "Try adjusting your search or filter."
              : <>After confirming a WhatsApp order, tap <strong>Log Order</strong> to record it here.</>}
          </p>
          {!search && filterStatus === "ALL" && (
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: "var(--color-gold-dark)" }}
            >
              <Plus size={16} /> Log Your First Order
            </button>
          )}
        </div>
      )}

      {/* Create order modal */}
      {showModal && (
        <CreateOrderModal
          products={products}
          onClose={() => setShowModal(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}
