import ProductsCard from "@/components/Product/ProductsCard";
import { Product } from "@prisma/client";
import React from "react";

type Props = {
  products: Product[];
};

const ProductGrid = ({ products }: Props) => {
  return (
    <div className="grid h-full w-full grid-cols-4 gap-2">
      {products.map((product) => (
        <ProductsCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
