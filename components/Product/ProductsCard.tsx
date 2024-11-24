"use client";
import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardContent,
} from "../ui/card";
import Image from "next/image";
import {
  AddToCartButton,
  BuyNowButton,
  GoToCartButton,
  WishListButton,
} from "./ProductCardButtons";
import { LuExternalLink } from "react-icons/lu";
import Link from "next/link";
import { originalPriceGetter, priceFormatter } from "@/util/helper";
import RatingBox from "../RatingBox/RatingBox";
import { IproductWithCartStatus } from "@/interfaces/actionInterface";

type Props = {
  product: IproductWithCartStatus;
};

const ProductsCard = ({ product }: Props) => {
  const {
    thumbnail,
    title,
    price,
    rating,
    discountPercentage,
    stock,
    brand,
    id,
    isInCart,
    isWishlisted,
  } = product;

  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const formattedPrice = priceFormatter(price);
  const originalPrice = originalPriceGetter(price, discountPercentage || 0);

  return (
    <div className="flex h-full w-full flex-col">
      <Card className="flex h-full w-full flex-col">
        <CardHeader className="relative flex h-full w-full flex-col">
          <Link
            href={`/products/${id}`}
            className="absolute right-5 top-5 z-20 rounded bg-white p-2 text-gray-600 transition-all hover:bg-slate-100"
          >
            <LuExternalLink className="h-5 w-5" />
          </Link>
          <div className="absolute bottom-5 right-5 z-20 h-9 w-9">
            <WishListButton isWishlisted={isWishlisted} productId={id} />
          </div>
          <Image src={thumbnail} alt={title} width={999} height={999} />
        </CardHeader>
        <CardContent className="flex h-full flex-col space-y-2">
          <p className="flex flex-grow flex-col gap-1 text-lg font-semibold text-black/80">
            {title}
            {brand && <span className="text-sm text-gray-500">by {brand}</span>}
          </p>
          <div className="flex items-baseline gap-3">
            <CardTitle className="text-2xl font-bold">
              {formattedPrice}
            </CardTitle>
            <p className="text-sm text-gray-500 line-through">
              {originalPrice}
            </p>
            {discountPercentage && (
              <p className="text-sm font-semibold text-green-700">
                {discountPercentage}% off
              </p>
            )}
          </div>
          <RatingBox rating={rating ?? 0} />
        </CardContent>
        <CardFooter className="">
          {stock ? (
            <div className="flex w-full flex-col items-center gap-2">
              <BuyNowButton
                productId={id}
                isBuyingNow={isBuyingNow}
                setIsBuyingNow={setIsBuyingNow}
              />
              {isInCart ? (
                <GoToCartButton />
              ) : (
                <AddToCartButton
                  productId={id}
                  isAddingToCart={isAddingToCart}
                  setIsAddingToCart={setIsAddingToCart}
                />
              )}
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
