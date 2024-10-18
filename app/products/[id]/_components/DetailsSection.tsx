"use client";
import React from "react";
import BreadCrumbLinks from "@/components/BreadCrumbsLinks/BreadCrumbsLinks";
import { usePathname } from "next/navigation";
import RatingBox from "@/components/RatingBox/RatingBox";
import { originalPriceGetter, priceFormatter } from "@/util/helper";
import SpecificationTable from "./SpecificationTable";
import RatingsTable from "./RatingsTable";
import { IproductWithCartStatus } from "@/interfaces/actionInterface";
import ComparisonBox from "./ComparisonBox";

type Props = {
  product: IproductWithCartStatus;
};

const DetailsSection = ({ product }: Props) => {
  let { title, discountPercentage, price, rating, reviews, id, isCompared } =
    product;

  // Set default values if they are null, undefined, or empty
  id = id ?? "";
  title = title ?? "";
  discountPercentage = discountPercentage ?? 0;
  price = price ?? 0;
  rating = rating ?? 0;
  reviews = reviews ?? [];
  isCompared = isCompared ?? false;

  const pathName = usePathname();

  const formattedPrice = priceFormatter(price);

  const originalPrice = priceFormatter(
    originalPriceGetter(price, discountPercentage),
  );

  return (
    <div className="flex h-full w-full flex-col gap-2">
      <div className="flex w-full items-center justify-between gap-2">
        <BreadCrumbLinks pathname={pathName} />
        <ComparisonBox productId={id} isCompared={isCompared} />
      </div>
      <div className="flex w-full flex-wrap text-lg font-semibold">{title}</div>
      <div className="flex w-full flex-wrap items-center gap-2">
        <RatingBox rating={rating} />
        <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
          {reviews.length} reviews
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-green-700">
          Special price
        </span>
        <span className="flex items-baseline gap-3 text-3xl font-medium">
          {formattedPrice}
          <span className="text-sm font-medium text-gray-400 line-through">
            {originalPrice}
          </span>
          <span className="text-sm font-medium text-green-700">
            {discountPercentage}% off
          </span>
        </span>
      </div>
      <SpecificationTable product={product} />
      <RatingsTable product={product} />
    </div>
  );
};

export default DetailsSection;
