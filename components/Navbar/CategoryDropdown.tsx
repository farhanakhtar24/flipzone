"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { CATEGORY_GROUPS } from "@/constant/CategoryGroups";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { PAGE_ROUTES } from "@/routes";

const CategoryDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="gap-1.5 font-semibold">
          Categories
          <ChevronDown
            className={`h-4 w-4 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="grid w-[540px] grid-cols-2 gap-x-6 gap-y-1 p-4"
      >
        {CATEGORY_GROUPS.map((group) => (
          <div key={group.slug} className="mb-2">
            <p className="text-muted-foreground px-2 pb-1 text-xs font-semibold uppercase tracking-wider">
              {group.label}
            </p>
            {group.leaves.map((leaf) => (
              <DropdownMenuItem key={leaf.slug} asChild>
                <Link
                  href={`${PAGE_ROUTES.PRODUCTS}?category=${encodeURIComponent(
                    leaf.slug,
                  )}`}
                  className="cursor-pointer px-2 py-1.5 text-sm"
                >
                  {leaf.label}
                </Link>
              </DropdownMenuItem>
            ))}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CategoryDropdown;
