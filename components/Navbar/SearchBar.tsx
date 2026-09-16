"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useQueryParam, parsers, serializers } from "@/hooks/use-query-params";
import { useRouter } from "nextjs-toploader/app";
import { PAGE_ROUTES } from "@/routes";
import { getSearchSuggestions, SearchSuggestion } from "@/actions/search.action";
import { priceFormatter } from "@/util/helper";
import { Search } from "lucide-react";

const DEBOUNCE_MS = 250;

const SearchBar = () => {
  const router = useRouter();
  const [searchParam, setSearchParam] = useQueryParam({
    key: "search",
    defaultValue: "",
    parser: (params) => parsers.string(params, "search"),
    serializer: serializers.string,
  });

  const [inputValue, setInputValue] = useState(searchParam);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced suggestion fetch
  useEffect(() => {
    const q = inputValue.trim();
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(() => {
      getSearchSuggestions(q).then((res) => {
        if (res.success && res.data) {
          setSuggestions(res.data);
          setOpen(res.data.length > 0);
        }
      });
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [inputValue]);

  // Close on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const submitSearch = (value: string) => {
    const v = value.trim().toLowerCase();
    setOpen(false);
    setSearchParam(v);
    if (
      typeof window !== "undefined" &&
      !window.location.pathname.startsWith(PAGE_ROUTES.PRODUCTS)
    ) {
      router.push(
        `${PAGE_ROUTES.PRODUCTS}${v ? `?search=${encodeURIComponent(v)}` : ""}`,
      );
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-xs sm:max-w-sm md:w-1/3 md:max-w-none"
    >
      <label htmlFor="product-search" className="sr-only">
        Search products
      </label>
      <div className="relative">
        <Search className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
        <input
          id="product-search"
          type="search"
          placeholder="Search products, brands…"
          autoComplete="off"
          className="bg-background w-full rounded-lg border py-2 pl-9 pr-3 text-sm"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              submitSearch(inputValue);
            } else if (e.key === "Escape") {
              setOpen(false);
            }
          }}
        />
      </div>

      {open && suggestions.length > 0 && (
        <div className="bg-popover absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border shadow-lg">
          <ul role="listbox" className="divide-y">
            {suggestions.map((s) => (
              <li key={s.id} role="option" aria-selected="false">
                <button
                  type="button"
                  className="hover:bg-accent flex w-full items-center gap-3 p-2.5 text-left"
                  onClick={() => {
                    setOpen(false);
                    router.push(`${PAGE_ROUTES.PRODUCTS}/${s.id}`);
                  }}
                >
                  <span className="bg-secondary relative h-10 w-10 shrink-0 overflow-hidden rounded-md">
                    <Image
                      src={s.thumbnail}
                      alt=""
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {s.title}
                    </span>
                    {s.category && (
                      <span className="text-muted-foreground block text-xs capitalize">
                        {s.category.replace(/-/g, " ")}
                      </span>
                    )}
                  </span>
                  <span className="text-sm font-semibold">
                    {priceFormatter(s.price)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="text-primary hover:bg-accent w-full p-2.5 text-center text-xs font-medium"
            onClick={() => submitSearch(inputValue)}
          >
            See all results for “{inputValue.trim()}”
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
