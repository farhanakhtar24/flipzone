"use client";

import { useQueryParam } from "@/hooks/use-query-params";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const ratingOptions = [
  { value: 4, label: "4★ & above" },
  { value: 3, label: "3★ & above" },
  { value: 2, label: "2★ & above" },
];

const RatingFilter = () => {
  const [rating, setRating] = useQueryParam<number>({
    key: "rating",
    defaultValue: 0,
    parser: (params) => Number(params.get("rating")) || 0,
    serializer: (value) => (value > 0 ? value.toString() : null),
  });

  return (
    <div className="space-y-2">
      {ratingOptions.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => setRating(rating === option.value ? 0 : option.value)}
          className={cn(
            "flex w-full items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors",
            rating === option.value
              ? "border-primary bg-primary/10 text-primary"
              : "border-border hover:bg-muted",
          )}
        >
          <Star
            className={cn(
              "h-4 w-4",
              rating === option.value
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground",
            )}
          />
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default RatingFilter;
