import ProductsCard from "@/components/Product/ProductsCard";
import { IproductWithCartStatus } from "@/interfaces/actionInterface";
import React from "react";

type Props = {
  products: IproductWithCartStatus[];
};

const ProductGrid = ({ products }: Props) => {
  return (
    <div className="grid h-full w-4/5 grid-cols-4 gap-2">
      {products.length === 0 && (
        <div className="flex h-full w-full items-center justify-center">
          <div className="text-xl font-medium">No products found</div>
        </div>
      )}
      {products.map((product) => (
        <ProductsCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
