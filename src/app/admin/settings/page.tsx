"use client";

import { useState, useEffect } from "react";
import { Save, Settings as SettingsIcon } from "lucide-react";

interface Setting {
  key: string;
  value: string;
}

const settingLabels: Record<string, { label: string; description: string }> = {
  store_name: { label: "Store Name", description: "Your store's brand name" },
  store_tagline: { label: "Store Tagline", description: "A short tagline for your store" },
  whatsapp_number: { label: "WhatsApp Number", description: "Full number with country code (e.g., 919876543210)" },
  instagram_handle: { label: "Instagram Handle", description: "Your Instagram username without @" },
  store_email: { label: "Contact Email", description: "Email for customer inquiries" },
  currency: { label: "Currency Code", description: "ISO currency code (e.g., INR, USD)" },
  currency_symbol: { label: "Currency Symbol", description: "Currency symbol (e.g., ₹, $)" },
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => setSettings(d.settings || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updateSetting = (key: string, value: string) => {
    setSettings((prev) =>
      prev.map((s) => (s.key === key ? { ...s, value } : s))
    );
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        alert("Failed to save settings");
      }
    } catch {
      alert("Error saving settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-black" style={{ fontFamily: "var(--font-serif)" }}>
            Settings
          </h1>
          <p className="text-xs sm:text-sm text-gray mt-0.5">Configure your store settings</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-gold !text-sm disabled:opacity-50 w-full sm:w-auto justify-center shadow-xs"
        >
          <Save size={16} />
          {saving ? "Saving..." : saved ? "✓ Saved!" : "Save Settings"}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray">Loading settings...</div>
      ) : (
        <div className="bg-white rounded-xl border border-gold/10 p-4 sm:p-5 shadow-xs">
          <div className="space-y-6">
            {settings.map((setting) => {
              const meta = settingLabels[setting.key] || { label: setting.key, description: "" };
              return (
                <div key={setting.key} className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 items-start">
                  <div className="md:pt-2">
                    <label className="text-sm font-semibold text-black">{meta.label}</label>
                    <p className="text-xs text-gray mt-0.5">{meta.description}</p>
                  </div>
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      value={setting.value}
                      onChange={(e) => updateSetting(setting.key, e.target.value)}
                      className="w-full px-4 py-2.5 bg-cream-light border border-gold/20 rounded-xl text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
