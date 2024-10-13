"use client";
import { Product } from "@prisma/client";
import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardContent,
} from "../ui/card";
import Image from "next/image";
import { AddToCartButton, BuyNowButton } from "./ProductCardButtons";
import { LuExternalLink } from "react-icons/lu";
import Link from "next/link";
import { priceFormatter } from "@/util/helper";
import RatingBox from "../RatingBox/RatingBox";

type Props = {
  product: Product;
};

const ProductsCard = ({ product }: Props) => {
  const { thumbnail, title, price, rating, discountPercentage, stock, brand } =
    product;

  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const formattedPrice = priceFormatter(price);

  return (
    <div className="relative flex h-full w-full flex-col">
      {!stock && (
        <div className="absolute left-0 top-0 z-10 flex h-full w-full cursor-not-allowed items-center justify-center rounded-lg bg-black/50">
          <p className="text-2xl font-semibold text-white">Out of Stock</p>
        </div>
      )}
      <Card className="flex h-full w-full flex-col">
        <CardHeader className="flex h-full w-full flex-col">
          <Link
            href={`/products/${product.id}`}
            className="absolute right-5 top-5 z-20 hover:opacity-75"
          >
            <LuExternalLink className="h-5 w-5" />
          </Link>
          <Image src={thumbnail} alt={title} width={999} height={999} />
        </CardHeader>
        <CardContent className="flex h-full flex-col space-y-2">
          <p className="flex flex-grow flex-col gap-1 text-lg font-semibold text-black/80">
            {title}
            <span className="text-sm text-gray-500">by {brand}</span>
          </p>
          <div className="flex items-baseline gap-3">
            <CardTitle className="text-2xl font-bold">
              {formattedPrice}
            </CardTitle>
            {discountPercentage && (
              <p className="text-sm font-semibold text-green-700">
                {discountPercentage}% off
              </p>
            )}
          </div>
          {/* <div className="flex items-center gap-2">
            <p className="text-sm text-gray-500">{rating} ⭐</p>
          </div> */}
          <RatingBox rating={rating ?? 0} />
        </CardContent>
        <CardFooter className="">
          {stock ? (
            <div className="flex w-full flex-col items-center gap-2">
              <BuyNowButton
                product={product}
                isBuyingNow={isBuyingNow}
                setIsBuyingNow={setIsBuyingNow}
              />
              <AddToCartButton
                product={product}
                isAddingToCart={isAddingToCart}
                setIsAddingToCart={setIsAddingToCart}
              />
            </div>
          ) : (
            <p className="my-2 text-red-500">Out of Stock</p>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default ProductsCard;
