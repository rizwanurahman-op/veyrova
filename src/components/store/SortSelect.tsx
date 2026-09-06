"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

export default function SortSelect({ defaultValue }: { defaultValue: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", e.target.value);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <select
      defaultValue={defaultValue}
      onChange={handleChange}
      className="text-xs sm:text-sm bg-cream-light border border-gold/20 rounded-xl px-2.5 sm:px-3 py-1.5 sm:py-2 focus:outline-none focus:ring-2 focus:ring-gold/20 text-charcoal font-medium cursor-pointer"
      id="sort-select"
    >
      <option value="newest">Newest First</option>
      <option value="price-asc">Price: Low to High</option>
      <option value="price-desc">Price: High to Low</option>
    </select>
  );
}
