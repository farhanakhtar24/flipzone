"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQueryParam } from "@/hooks/use-query-params";
import { ArrowUpDown } from "lucide-react";

const sortOptions = [
  { value: "rating:desc", label: "Rating: High to Low" },
  { value: "rating:asc", label: "Rating: Low to High" },
  { value: "price:desc", label: "Price: High to Low" },
  { value: "price:asc", label: "Price: Low to High" },
];

const SortBy = () => {
  const [sortBy, setSortBy] = useQueryParam({
    key: "sortBy",
    defaultValue: "rating:desc",
    parser: (params) => params.get("sortBy") || "rating:desc",
    serializer: (value: string) => value,
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-[180px] justify-between">
          {sortOptions.find((option) => option.value === sortBy)?.label ||
            "Sort By"}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[180px]">
        <DropdownMenuRadioGroup value={sortBy} onValueChange={setSortBy}>
          {sortOptions.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SortBy;
