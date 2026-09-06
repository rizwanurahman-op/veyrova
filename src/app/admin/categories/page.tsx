"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, FolderTree, Save, X } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  status: string;
  parentId: string | null;
  children: Category[];
  _count?: { products: number };
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    parentId: "",
    sortOrder: 0,
    status: "ACTIVE",
  });

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data.categories || []);
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const resetForm = () => {
    setForm({ name: "", description: "", parentId: "", sortOrder: 0, status: "ACTIVE" });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const url = editingId ? `/api/admin/categories/${editingId}` : "/api/admin/categories";
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        resetForm();
        fetchCategories();
      } else {
        alert("Failed to save category");
      }
    } catch {
      alert("Error saving category");
    }
  };

  const handleEdit = (cat: Category) => {
    setForm({
      name: cat.name,
      description: cat.description || "",
      parentId: cat.parentId || "",
      sortOrder: cat.sortOrder,
      status: cat.status,
    });
    setEditingId(cat.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"? This will also delete all subcategories.`)) return;

    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      if (res.ok) fetchCategories();
      else alert("Failed to delete category");
    } catch {
      alert("Error deleting category");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-black" style={{ fontFamily: "var(--font-serif)" }}>
            Categories
          </h1>
          <p className="text-sm text-gray mt-1">Manage your product categories and hierarchy</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="btn-gold !text-sm"
        >
          <Plus size={16} /> Add Category
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gold/10 p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-black" style={{ fontFamily: "var(--font-serif)" }}>
              {editingId ? "Edit Category" : "New Category"}
            </h3>
            <button onClick={resetForm} className="p-1 text-gray hover:text-red-500">
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray uppercase tracking-wider mb-1.5 block">Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 bg-cream-light border border-gold/20 rounded-xl text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all"
                  placeholder="Category name"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray uppercase tracking-wider mb-1.5 block">Parent Category</label>
                <select
                  value={form.parentId}
                  onChange={(e) => setForm({ ...form, parentId: e.target.value })}
                  className="w-full px-4 py-2.5 bg-cream-light border border-gold/20 rounded-xl text-sm focus:outline-none focus:border-gold transition-all"
                >
                  <option value="">None (Top Level)</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray uppercase tracking-wider mb-1.5 block">Description</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-2.5 bg-cream-light border border-gold/20 rounded-xl text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all"
                placeholder="Brief description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray uppercase tracking-wider mb-1.5 block">Sort Order</label>
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 bg-cream-light border border-gold/20 rounded-xl text-sm focus:outline-none focus:border-gold transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray uppercase tracking-wider mb-1.5 block">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-4 py-2.5 bg-cream-light border border-gold/20 rounded-xl text-sm focus:outline-none focus:border-gold transition-all"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button type="button" onClick={resetForm} className="btn-outline !text-sm !py-2">
                Cancel
              </button>
              <button type="submit" className="btn-gold !text-sm !py-2">
                <Save size={14} /> {editingId ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories Tree */}
      <div className="bg-white rounded-xl border border-gold/10 overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-gray">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12">
            <FolderTree size={40} className="text-gray-lighter mx-auto mb-3" />
            <p className="text-gray mb-2">No categories yet</p>
            <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-gold !text-sm">
              <Plus size={14} /> Create First Category
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-lighter/50">
            {categories.map((cat) => (
              <div key={cat.id}>
                {/* Parent Category */}
                <div className="flex items-center justify-between px-5 py-3 hover:bg-cream-light/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center">
                      <FolderTree size={16} className="text-gold-dark" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-black">{cat.name}</p>
                      <p className="text-xs text-gray">
                        {cat.children.length} subcategories
                        {cat.description ? ` • ${cat.description}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      cat.status === "ACTIVE" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                    }`}>
                      {cat.status}
                    </span>
                    <button onClick={() => handleEdit(cat)} className="p-1.5 text-gray hover:text-gold-dark hover:bg-gold/10 rounded-lg transition-all">
                      <Edit size={14} />
                    </button>
                    <button onClick={() => handleDelete(cat.id, cat.name)} className="p-1.5 text-gray hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Children */}
                {cat.children.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between px-5 py-2.5 pl-14 hover:bg-cream-light/50 transition-colors border-t border-gray-lighter/30"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-gray-light text-xs">└─</span>
                      <div>
                        <p className="text-sm text-charcoal">{sub.name}</p>
                        {sub.description && (
                          <p className="text-xs text-gray">{sub.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleEdit(sub)} className="p-1.5 text-gray hover:text-gold-dark hover:bg-gold/10 rounded-lg transition-all">
                        <Edit size={13} />
                      </button>
                      <button onClick={() => handleDelete(sub.id, sub.name)} className="p-1.5 text-gray hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
