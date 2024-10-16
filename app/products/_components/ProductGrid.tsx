import ProductsCard from "@/components/Product/ProductsCard";
import { IproductWithCartStatus } from "@/interfaces/actionInterface";
import React from "react";

type Props = {
  products: IproductWithCartStatus[];
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
