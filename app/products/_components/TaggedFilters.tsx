"use client";
import React, { useEffect, useState } from "react";
import { FaXmark } from "react-icons/fa6";

type Props = {
  filters: {
    search: string | string[] | undefined;
    priceRange: string | string[] | undefined;
    rating: string | string[] | undefined;
    discountPercentage: string | string[] | undefined;
    brand: string | string[] | undefined;
    category: string | string[] | undefined;
    sortBy: string | string[] | undefined;
  };
};

const TaggedFilters = ({ filters }: Props) => {
  const {
    search,
    priceRange,
    rating,
    discountPercentage,
    brand,
    category,
    sortBy,
  } = filters;

  const [filterArray, setFilterArray] = useState<
    { value: string | string[] | undefined; label: string }[]
  >([]);

  const [hasFilter, setHasFilter] = useState(false);

  useEffect(() => {
    const filterArray = [
      { value: search, label: "Search" },
      {
        value: priceRange
          ?.toString()
          .replace(/[\[\]]/g, "")
          .replace(",", "-"),
        label: "Price Range",
      },
      { value: rating, label: "Rating" },
      { value: discountPercentage, label: "Discount Percentage" },
      { value: brand, label: "Brand" },
      { value: category, label: "Category" },
      { value: sortBy, label: "Sort By" },
    ];

    setFilterArray(filterArray);
  }, [search, priceRange, rating, discountPercentage, brand, category, sortBy]);

  useEffect(() => {
    if (filterArray.some((filter) => filter.value)) {
      setHasFilter(true);
    } else {
      setHasFilter(false);
    }
  }, [filterArray]);

  return (
    <>
      {hasFilter && (
        <div className="flex w-full flex-wrap gap-2">
          {filterArray.map((filter, index) => {
            return (
              filter.value && (
                <span
                  key={index}
                  className="flex w-fit items-center gap-1 rounded bg-slate-500 p-2 text-xs text-white transition-all"
                >
                  <FaXmark
                    className="cursor-pointer hover:text-white/80"
                    onClick={() =>
                      setFilterArray(
                        filterArray.filter((f) => f.value !== filter.value),
                      )
                    }
                  />
                  <p>{filter.value}</p>
                </span>
              )
            );
          })}
        </div>
      )}
    </>
  );
};

export default TaggedFilters;
