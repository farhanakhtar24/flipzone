"use client";

import { useQueryParam } from "@/hooks/use-query-params";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useState } from "react";
import { getAllBrands } from "@/actions/category.action";

const BrandFilter = () => {
  const [selectedBrands, setSelectedBrands] = useQueryParam<string[]>({
    key: "brand",
    defaultValue: [],
    parser: (params) => params.get("brand")?.split(",").filter(Boolean) ?? [],
    serializer: (value) => (value.length ? value.join(",") : null),
  });

  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrands = async () => {
      const { data } = await getAllBrands();
      setBrands(data ?? []);
      setLoading(false);
    };
    fetchBrands();
  }, []);

  const toggleBrand = (brand: string, checked: boolean) => {
    if (checked) {
      setSelectedBrands([...selectedBrands, brand]);
    } else {
      setSelectedBrands(selectedBrands.filter((b) => b !== brand));
    }
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading brands...</p>;
  }

  if (brands.length === 0) {
    return <p className="text-sm text-muted-foreground">No brands available.</p>;
  }

  return (
    <div className="max-h-[200px] space-y-2 overflow-y-auto">
      {brands.map((brand) => (
        <div key={brand} className="flex items-center space-x-2">
          <Checkbox
            id={`brand-${brand}`}
            checked={selectedBrands.includes(brand)}
            onCheckedChange={(checked) =>
              toggleBrand(brand, checked as boolean)
            }
          />
          <label
            htmlFor={`brand-${brand}`}
            className="cursor-pointer text-sm leading-none"
          >
            {brand}
          </label>
        </div>
      ))}
    </div>
  );
};

export default BrandFilter;
