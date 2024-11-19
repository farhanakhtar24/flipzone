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
    <div>
      <Switch checked={inStock} onCheckedChange={setInStock} />
    </div>
  );
};

export default InStock;
