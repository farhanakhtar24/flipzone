"use client";

import React, { useCallback, useState } from "react";
import { DualRangeSlider } from "@/components/ui/dual-range-slider";
import { useQueryParam, parsers, serializers } from "@/hooks/use-query-params";

const PriceSlider = () => {
  const [priceRange, setPriceRange] = useQueryParam({
    key: "priceRange",
    defaultValue: [0, 40000] as [number, number],
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
      if (values[0] === 0 && values[1] === 40000) {
        setPriceRange([0, 40000] as [number, number]);
      } else {
        setPriceRange([values[0], values[1]] as [number, number]);
      }
    },
    [setPriceRange],
  );

  return (
    <div className="flex w-full flex-col gap-2 pb-5 pl-0 pr-5 pt-10">
      <DualRangeSlider
        label={(value) => <span>${value}</span>}
        value={localRange}
        onValueChange={handleValueChange}
        step={400}
        onValueCommit={handleValueCommit}
        min={0}
        max={40000}
      />
    </div>
  );
};

export default PriceSlider;
