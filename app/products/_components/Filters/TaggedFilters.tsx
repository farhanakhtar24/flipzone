"use client";

import { useSearchParams, usePathname } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

const FILTER_LABELS: Record<string, string> = {
  search: "Search",
  priceRange: "Price",
  rating: "Rating",
  discountPercentage: "Discount",
  brand: "Brand",
  category: "Category",
  sortBy: "Sort",
  inStock: "In Stock",
};

const TaggedFilters = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeFilters: { key: string; label: string; value: string }[] = [];

  searchParams.forEach((value, key) => {
    if (key === "sortBy" && value === "rating:desc") return;
    const label = FILTER_LABELS[key];
    if (label) {
      activeFilters.push({ key, label, value });
    }
  });

  if (activeFilters.length === 0) return null;

  const removeFilter = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    const search = params.toString();
    router.push(`${pathname}${search ? `?${search}` : ""}`);
  };

  const clearAll = () => {
    router.push(pathname);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {activeFilters.map(({ key, label, value }) => (
        <button
          key={key}
          type="button"
          onClick={() => removeFilter(key)}
          className="inline-flex items-center gap-1 rounded-full border bg-muted px-3 py-1 text-xs font-medium transition-colors hover:bg-muted/80"
        >
          <span className="text-muted-foreground">{label}:</span>
          <span>{formatFilterValue(key, value)}</span>
          <X className="h-3 w-3" />
        </button>
      ))}
      <Button
        variant="ghost"
        size="sm"
        className="text-xs text-muted-foreground"
        onClick={clearAll}
      >
        Clear all
      </Button>
    </div>
  );
};

function formatFilterValue(key: string, value: string): string {
  if (key === "category" || key === "brand") {
    return value.length > 20 ? `${value.substring(0, 20)}...` : value;
  }
  if (key === "inStock") return value === "true" ? "Yes" : "No";
  if (key === "rating") return `${value}★+`;
  if (key === "discountPercentage") return `${value}%+`;
  if (key === "sortBy") {
    const labels: Record<string, string> = {
      "rating:desc": "Rating ↓",
      "rating:asc": "Rating ↑",
      "price:desc": "Price ↓",
      "price:asc": "Price ↑",
    };
    return labels[value] ?? value;
  }
  return value.length > 20 ? `${value.substring(0, 20)}...` : value;
}

export default TaggedFilters;
