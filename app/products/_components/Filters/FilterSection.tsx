"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import React, { useState } from "react";
import { Accordion } from "@/components/ui/accordion";
import FilterAccordionItem from "./FilterAccordionItem";
import PriceSlider from "./PriceSlider";
import SortBy from "./SortBy";
import InStock from "./InStock";
import BrandFilter from "./BrandFilter";
import CategoryFilter from "./CategoryFilter";
import RatingFilter from "./RatingFilter";
import DiscountFilter from "./DiscountFilter";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const FilterSection = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full md:w-64 md:shrink-0">
      <Button
        variant="outline"
        className="mb-3 w-full md:hidden"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-controls="product-filters"
      >
        <SlidersHorizontal className="mr-2 h-4 w-4" />
        {open ? "Hide filters" : "Show filters"}
      </Button>
      <Card
        id="product-filters"
        className={cn(
          "flex h-fit w-full flex-col divide-y",
          !open && "hidden md:flex",
        )}
      >
        <CardHeader className="flex w-full flex-col gap-2">
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <Accordion type="multiple" className="w-full divide-y">
          <FilterAccordionItem title="Sort By">
            <SortBy />
          </FilterAccordionItem>
          <FilterAccordionItem title="Category">
            <CategoryFilter />
          </FilterAccordionItem>
          <FilterAccordionItem title="Brand">
            <BrandFilter />
          </FilterAccordionItem>
          <FilterAccordionItem title="Price">
            <PriceSlider />
          </FilterAccordionItem>
          <FilterAccordionItem title="Rating">
            <RatingFilter />
          </FilterAccordionItem>
          <FilterAccordionItem title="Discount">
            <DiscountFilter />
          </FilterAccordionItem>
          <FilterAccordionItem title="In Stock">
            <InStock />
          </FilterAccordionItem>
        </Accordion>
      </Card>
    </div>
  );
};

export default FilterSection;
