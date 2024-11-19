import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";
import { Accordion } from "@/components/ui/accordion";
import FillterAccordianItem from "./FillterAccordianItem";
import PriceSlider from "./PriceSlider";
import SortBy from "./SortBy";
import InStock from "./InStock";
// import TaggedFilters from "./TaggedFilters";

const FilterSection = () => {
  return (
    <Card className="flex h-fit w-1/5 flex-col divide-y">
      <CardHeader className="flex w-full flex-col gap-2">
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <Accordion type="multiple" className="w-full divide-y">
        <FillterAccordianItem title="Price">
          <PriceSlider />
        </FillterAccordianItem>
        <FillterAccordianItem title="Sort-By">
          <SortBy />
        </FillterAccordianItem>
        <FillterAccordianItem title="In-Stock">
          <InStock />
        </FillterAccordianItem>
      </Accordion>
    </Card>
  );
};

export default FilterSection;
