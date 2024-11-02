"use client";
import React, { useState } from "react";
import { useQueryParam, parsers, serializers } from "@/hooks/use-query-params";

const SearchBar = () => {
  const [searchParam, setSearchParam] = useQueryParam({
    key: "search",
    defaultValue: "",
    parser: (params) => parsers.string(params, "search"),
    serializer: serializers.string,
  });

  const [inputValue, setInputValue] = useState(searchParam);

  const handleSearch = () => {
    if (inputValue.trim()) {
      setSearchParam(inputValue.toLowerCase());
    } else {
      setSearchParam("");
    }
  };

  return (
    <input
      type="text"
      placeholder="Search"
      className="hidden w-1/3 rounded-lg border px-3 py-2 text-sm md:block"
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          handleSearch();
        }
      }}
    />
  );
};

export default SearchBar;
