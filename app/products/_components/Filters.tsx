"use client";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";
import TaggedFilters from "./TaggedFilters";

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

const Filters = ({ filters }: Props) => {
  return (
    <Card className="flex h-fit w-1/5 flex-col divide-y">
      <CardHeader className="flex w-full flex-col gap-2">
        <CardTitle>Filters</CardTitle>
        <TaggedFilters filters={filters} />
      </CardHeader>
      <div className="flex w-full p-6"></div>
    </Card>
  );
};

export default Filters;
