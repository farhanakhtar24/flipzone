"use client";
import React from "react";
import SpecificationTable from "./SpecificationTable";
import RatingsTable from "./RatingsTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IproductWithCartStatus } from "@/interfaces/actionInterface";

type Props = {
  product: IproductWithCartStatus;
};

/** Description / Specifications / Reviews tabs beneath the hero purchase area. */
const ProductTabs = ({ product }: Props) => {
  const reviewCount = product.reviews?.length ?? 0;

  return (
    <Tabs defaultValue="description" className="w-full">
      <TabsList className="w-full justify-start overflow-x-auto">
        <TabsTrigger value="description">Description</TabsTrigger>
        <TabsTrigger value="specifications">Specifications</TabsTrigger>
        <TabsTrigger value="reviews">Reviews ({reviewCount})</TabsTrigger>
      </TabsList>
      <TabsContent value="description" className="pt-6">
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <p className="text-muted-foreground leading-relaxed">
            {product.description || "No description available for this product."}
          </p>
          {product.tags && product.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </TabsContent>
      <TabsContent value="specifications" className="pt-6">
        <SpecificationTable product={product} />
      </TabsContent>
      <TabsContent value="reviews" className="pt-6">
        <RatingsTable product={product} />
      </TabsContent>
    </Tabs>
  );
};

export default ProductTabs;
