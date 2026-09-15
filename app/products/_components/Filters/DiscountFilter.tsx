"use client";

import { useQueryParam } from "@/hooks/use-query-params";
import { cn } from "@/lib/utils";

const discountOptions = [
  { value: 10, label: "10% & above" },
  { value: 20, label: "20% & above" },
  { value: 30, label: "30% & above" },
  { value: 40, label: "40% & above" },
];

const DiscountFilter = () => {
  const [discount, setDiscount] = useQueryParam<number>({
    key: "discountPercentage",
    defaultValue: 0,
    parser: (params) => Number(params.get("discountPercentage")) || 0,
    serializer: (value) => (value > 0 ? value.toString() : null),
  });

  return (
    <div className="space-y-2">
      {discountOptions.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() =>
            setDiscount(discount === option.value ? 0 : option.value)
          }
          className={cn(
            "w-full rounded-md border px-3 py-2 text-left text-sm transition-colors",
            discount === option.value
              ? "border-primary bg-primary/10 text-primary"
              : "border-border hover:bg-muted",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default DiscountFilter;
