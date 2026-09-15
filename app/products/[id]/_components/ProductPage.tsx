import React from "react";
import PhotoSection from "./PhotoSection";
import BuyPanel from "./BuyPanel";
import ProductTabs from "./ProductTabs";
import { IproductWithCartStatus } from "@/interfaces/actionInterface";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";

type Props = {
  product: IproductWithCartStatus;
};

const ProductPage = ({ product }: Props) => {
  return (
    <div className="w-full">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/products">Products</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="max-w-[200px] truncate sm:max-w-none">
              {product.title}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0">
          <PhotoSection product={product} />
        </div>
        <div>
          <BuyPanel product={product} />
        </div>
      </div>

      <div className="mt-12">
        <ProductTabs product={product} />
      </div>
    </div>
  );
};

export default ProductPage;
