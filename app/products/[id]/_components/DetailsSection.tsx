"use client";
import React from "react";
import { Product } from "@prisma/client";
import BreadCrumbLinks from "@/components/BreadCrumbsLinks/BreadCrumbsLinks";
import { usePathname } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import RatingBox from "@/components/RatingBox/RatingBox";
import { originalPriceGetter, priceFormatter } from "@/util/helper";

type Props = {
  product: Product;
};

const DetailsSection = ({ product }: Props) => {
  let {
    title,
    description,
    brand,
    discountPercentage,
    price,
    rating,
    returnPolicy,
    stock,
    warrantyInformation,
    reviews,
  } = product;

  if (
    !description ||
    !title ||
    !brand ||
    !discountPercentage ||
    !price ||
    !rating ||
    !returnPolicy ||
    !stock ||
    !warrantyInformation ||
    !reviews
  ) {
    description = "";
    title = "";
    brand = "";
    discountPercentage = 0;
    price = 0;
    rating = 0;
    returnPolicy = "";
    stock = 0;
    warrantyInformation = "";
    reviews = [];
  }

  const pathName = usePathname();

  const formattedPrice = priceFormatter(price);

  const originalPrice = priceFormatter(
    originalPriceGetter(price, discountPercentage),
  );

  return (
    <div className="flex h-full w-full flex-col gap-2">
      <div className="flex w-full items-center justify-between gap-2">
        <BreadCrumbLinks pathname={pathName} />
        <div className="flex items-center space-x-2">
          <Checkbox id="Compare" />
          <label
            htmlFor="Compare"
            className="text-sm font-light leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Compare
          </label>
        </div>
      </div>
      <div className="flex w-full flex-wrap text-lg font-medium">{title}</div>
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
    </div>
  );
};

export default DetailsSection;
