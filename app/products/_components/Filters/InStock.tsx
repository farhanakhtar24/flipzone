"use client";
import { Switch } from "@/components/ui/switch";
import { useQueryParam } from "@/hooks/use-query-params";
import React from "react";

const InStock = () => {
  const [inStock, setInStock] = useQueryParam<boolean>({
    key: "inStock",
    defaultValue: false,
    parser: (params) => params.get("inStock") === "true",
    serializer: (value) => (value ? "true" : "false"),
  });

  return (
    <div className="flex items-center gap-2">
      <Switch
        id="in-stock"
        checked={inStock}
        onCheckedChange={setInStock}
      />
      <label htmlFor="in-stock" className="text-sm">
        In stock only
      </label>
    </div>
  );
};

export default InStock;
