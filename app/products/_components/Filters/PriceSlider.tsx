"use client";

import React, { useCallback, useState } from "react";
import { DualRangeSlider } from "@/components/ui/dual-range-slider";
import { useQueryParam, parsers, serializers } from "@/hooks/use-query-params";

const PriceSlider = () => {
  const [priceRange, setPriceRange] = useQueryParam({
    key: "priceRange",
    defaultValue: [0, 1000] as [number, number],
    parser: (params) => parsers.range(params, "priceRange"),
    serializer: serializers.range,
  });

  // Local state for smooth sliding
  const [localRange, setLocalRange] = useState<[number, number]>(priceRange);

  const handleValueChange = useCallback((values: number[]) => {
    setLocalRange([values[0], values[1]] as [number, number]);
  }, []);

  const handleValueCommit = useCallback(
    (values: number[]) => {
      if (values[0] === 0 && values[1] === 1000) {
        setPriceRange([0, 1000] as [number, number]);
      } else {
        setPriceRange([values[0], values[1]] as [number, number]);
      }
    },
    [setPriceRange],
  );

  return (
    <div className="flex w-full flex-col gap-2 pb-5 pr-5 pt-10">
      <DualRangeSlider
        label={(value) => <span>${value}</span>}
        value={localRange}
        onValueChange={handleValueChange}
        onValueCommit={handleValueCommit}
        min={0}
        max={1000}
        step={10}
      />
    </div>
  );
};

export default PriceSlider;
