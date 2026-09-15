import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";
import { Accordion } from "@/components/ui/accordion";
import FilterAccordionItem from "./FilterAccordionItem";
import PriceSlider from "./PriceSlider";
import SortBy from "./SortBy";
import InStock from "./InStock";
import BrandFilter from "./BrandFilter";
import CategoryFilter from "./CategoryFilter";
import RatingFilter from "./RatingFilter";
import DiscountFilter from "./DiscountFilter";

const FilterSection = () => {
  return (
    <Card className="flex h-fit w-1/5 flex-col divide-y">
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
  );
};

export default FilterSection;
