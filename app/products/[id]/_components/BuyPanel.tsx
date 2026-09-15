"use client";
import React, { useState } from "react";
import {
  AddToCartButton,
  BuyNowButton,
  GoToCartButton,
  WishListButton,
} from "@/components/Product/ProductCardButtons";
import { originalPriceGetter, priceFormatter } from "@/util/helper";
import { IproductWithCartStatus } from "@/interfaces/actionInterface";
import { Star, Truck, RotateCcw, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ComparisonBox from "./ComparisonBox";

type Props = {
  product: IproductWithCartStatus;
};

/** Sticky right-hand purchase panel: price, rating, stock, buy actions, policies. */
const BuyPanel = ({ product }: Props) => {
  const {
    id,
    title,
    brand,
    price,
    rating,
    reviews,
    discountPercentage,
    stock,
    availabilityStatus,
    isInCart,
    isWishlisted,
    isCompared,
    shippingInformation,
    warrantyInformation,
    returnPolicy,
  } = product;

  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const outOfStock = !stock || stock < 1;
  const lowStock = !outOfStock && stock <= 10;
  const reviewCount = reviews?.length ?? 0;

  return (
    <div className="bg-card sticky top-24 flex flex-col gap-4 rounded-xl border p-5 md:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          {brand && (
            <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
              {brand}
            </p>
          )}
          <h1 className="mt-1 text-xl font-bold tracking-tight md:text-2xl">
            {title}
          </h1>
        </div>
        <div className="h-9 w-9 shrink-0">
          <WishListButton isWishlisted={!!isWishlisted} productId={id} />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="bg-primary/10 text-primary flex items-center gap-1 rounded-md px-2 py-1 text-sm font-semibold">
          <Star className="h-3.5 w-3.5 fill-current" />
          {(rating ?? 0).toFixed(1)}
        </span>
        <span className="text-muted-foreground text-sm">
          {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
        </span>
      </div>

      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold tracking-tight">
          {priceFormatter(price)}
        </span>
        {discountPercentage ? (
          <>
            <span className="text-muted-foreground line-through">
              {priceFormatter(originalPriceGetter(price, discountPercentage))}
            </span>
            <Badge className="border-0 bg-emerald-600 font-semibold text-white">
              {Math.round(discountPercentage)}% off
            </Badge>
          </>
        ) : null}
      </div>

      <div className="text-sm">
        {outOfStock ? (
          <span className="text-destructive font-medium">
            {availabilityStatus || "Out of stock"}
          </span>
        ) : lowStock ? (
          <span className="font-medium text-amber-600">
            Only {stock} left — order soon
          </span>
        ) : (
          <span className="font-medium text-emerald-600">In stock</span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {outOfStock ? null : (
          <>
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
          </>
        )}
      </div>

      <div className="border-t pt-4">
        <ComparisonBox productId={id} isCompared={!!isCompared} />
      </div>

      <ul className="text-muted-foreground space-y-2 border-t pt-4 text-sm">
        <li className="flex items-center gap-2">
          <Truck className="text-primary h-4 w-4" />
          {shippingInformation || "Ships in 2-3 business days"}
        </li>
        <li className="flex items-center gap-2">
          <ShieldCheck className="text-primary h-4 w-4" />
          {warrantyInformation || "1 year warranty"}
        </li>
        <li className="flex items-center gap-2">
          <RotateCcw className="text-primary h-4 w-4" />
          {returnPolicy || "30 days return policy"}
        </li>
      </ul>
    </div>
  );
};

export default BuyPanel;
