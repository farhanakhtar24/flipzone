"use client";
import { PAGE_ROUTES } from "@/routes";
import { useRouter } from "nextjs-toploader/app";
import React, { useState } from "react";

const SearchBar = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  return (
    <input
      type="text"
      placeholder="Search"
      className="hidden w-1/3 rounded-lg border px-3 py-2 text-sm md:block"
      value={search}
      onChange={(e) => setSearch(e.target.value.toLowerCase())}
      onKeyDown={(e) => {
        if (e.key === "Enter" && search) {
          router.push(`${PAGE_ROUTES.PRODUCTS}?search=${search}`);
        }
      }}
    />
  );
};

export default SearchBar;
