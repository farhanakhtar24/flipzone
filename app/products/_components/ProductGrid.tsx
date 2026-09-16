import ProductsCard from "@/components/Product/ProductsCard";
import { Product } from "@prisma/client";
import React from "react";

type Props = {
  products: Product[];
  cartIds?: string[];
  wishlistIds?: string[];
};

const ProductGrid = ({ products, cartIds = [], wishlistIds = [] }: Props) => {
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
        <ProductsCard
          key={product.id}
          product={product}
          isInCart={cartIds.includes(product.id)}
          isWishlisted={wishlistIds.includes(product.id)}
        />
      ))}
    </div>
  );
};

export default ProductGrid;
