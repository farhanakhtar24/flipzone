import { Card } from "@/components/ui/card";
import { Product } from "@prisma/client";
import React from "react";
import PhotoSection from "./PhotoSection";
import DetailsSection from "./DetailsSection";

type Props = {
  product: Product;
};

const ProductPage = ({ product }: Props) => {
  return (
    <Card className="flex h-full w-full gap-5 bg-white p-5">
      <div className="w-[40%]">
        <PhotoSection product={product} />
      </div>
      <div className="w-[60%]">
        <DetailsSection product={product} />
      </div>
    </Card>
  );
};

export default ProductPage;
