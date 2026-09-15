"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Accordion } from "@/components/ui/accordion";
import FilterAccordionItem from "./FilterAccordionItem";
import PriceSlider from "./PriceSlider";
import InStock from "./InStock";
import BrandFilter from "./BrandFilter";
import CategoryFilter from "./CategoryFilter";
import RatingFilter from "./RatingFilter";
import DiscountFilter from "./DiscountFilter";
import { SlidersHorizontal } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

/**
 * The same filter set, shared between the desktop sidebar render and the
 * mobile Sheet drawer (parent renders it twice under different shells).
 */
export const FilterControls = () => (
  <Accordion type="multiple" className="w-full divide-y">
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
);

const FilterSection = () => {
  return (
    <>
      {/* Desktop sticky sidebar */}
      <aside className="hidden w-64 shrink-0 md:block">
        <div className="sticky top-24">
          <div className="bg-card rounded-xl border">
            <div className="border-b px-5 py-4">
              <p className="font-semibold">Filters</p>
            </div>
            <div className="max-h-[calc(100vh-12rem)] overflow-y-auto px-2">
              <FilterControls />
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile drawer trigger (toolbar renders the count next to it) */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[320px] p-0">
            <SheetHeader className="border-b px-5 py-4 text-left">
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <ScrollArea className="h-[calc(100%-4rem)] px-5 py-2">
              <FilterControls />
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
};

export default FilterSection;
