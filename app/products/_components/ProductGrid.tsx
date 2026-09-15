import ProductsCard from "@/components/Product/ProductsCard";
import { IproductWithCartStatus } from "@/interfaces/actionInterface";
import React from "react";

type Props = {
  products: IproductWithCartStatus[];
};

const ProductGrid = ({ products }: Props) => {
  return (
    <div className="grid h-full w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.length === 0 && (
        <div className="col-span-full flex h-40 w-full items-center justify-center">
          <div className="text-xl font-medium text-muted-foreground">
            No products found
          </div>
        </div>
      )}
      {products.map((product) => (
        <ProductsCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
