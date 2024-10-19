"use client";
import useFetchCategories from "@/hooks/use-fetch-categories";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";

const CategoryDropdown = () => {
  const { categories, loading, error } = useFetchCategories();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1 font-semibold">
        Categories <MdOutlineKeyboardArrowDown />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="absolute -right-14 top-0 w-[400px]">
        <div className="flex w-full flex-col">
          <DropdownMenuLabel>Product Categories</DropdownMenuLabel>
          <DropdownMenuSeparator />
        </div>
        <div className="grid grid-cols-2">
          {loading && <div>Loading...</div>}
          {error && <div>Error: {error}</div>}
          {categories.map((category) => (
            <Link href={`/products/${category.name}`} key={category.id}>
              <DropdownMenuItem className="cursor-pointer">
                {category.name}
              </DropdownMenuItem>
            </Link>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CategoryDropdown;
