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
    <Card className="flex h-full w-full bg-white p-5">
      <PhotoSection product={product} />
      <DetailsSection product={product} />
    </Card>
  );
};

export default ProductPage;
