"use client";
import React, { useState } from "react";
import { useQueryParam, parsers, serializers } from "@/hooks/use-query-params";
import { useRouter } from "nextjs-toploader/app";
import { PAGE_ROUTES } from "@/routes";

const SearchBar = () => {
  const router = useRouter();
  const [searchParam, setSearchParam] = useQueryParam({
    key: "search",
    defaultValue: "",
    parser: (params) => parsers.string(params, "search"),
    serializer: serializers.string,
  });

  const [inputValue, setInputValue] = useState(searchParam);

  const handleSearch = () => {
    const value = inputValue.trim().toLowerCase();
    setSearchParam(value);
    if (typeof window !== "undefined" && !window.location.pathname.startsWith(PAGE_ROUTES.PRODUCTS)) {
      const query = value ? `?search=${encodeURIComponent(value)}` : "";
      router.push(`${PAGE_ROUTES.PRODUCTS}${query}`);
    }
  };

  return (
    <div className="w-full max-w-xs sm:max-w-sm md:w-1/3 md:max-w-none">
      <label htmlFor="product-search" className="sr-only">
        Search products
      </label>
      <input
        id="product-search"
        type="search"
        placeholder="Search products"
        className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSearch();
          }
        }}
      />
    </div>
  );
};

export default SearchBar;
