"use client";
import React, { useState } from "react";
import { Card, CardContent } from "../ui/card";
import Image from "next/image";
import {
  AddToCartButton,
  GoToCartButton,
  WishListButton,
} from "./ProductCardButtons";
import Link from "next/link";
import { originalPriceGetter, priceFormatter } from "@/util/helper";
import { Star } from "lucide-react";
import { Badge } from "../ui/badge";
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

  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const formattedPrice = priceFormatter(price);
  const originalPrice = originalPriceGetter(price, discountPercentage || 0);
  const outOfStock = !stock || stock < 1;

  return (
    <Card className="group hover:ring-primary/25 relative flex h-full w-full flex-col overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-lg hover:ring-1">
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-secondary">
        <Link
          href={`/products/${id}`}
          aria-label={title}
          className="absolute inset-0"
        >
          <Image
            src={thumbnail}
            alt={title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
        {discountPercentage ? (
          <Badge className="bg-primary absolute left-3 top-3 border-0 font-semibold text-primary-foreground">
            -{Math.round(discountPercentage)}%
          </Badge>
        ) : null}
        <div className="absolute right-3 top-3 h-9 w-9">
          <WishListButton isWishlisted={isWishlisted} productId={id} />
        </div>
      </div>

      <CardContent className="flex flex-1 flex-col gap-1.5 p-4 pb-2">
        {brand && (
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
            {brand}
          </p>
        )}
        <Link href={`/products/${id}`}>
          <h3 className="hover:text-primary line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug">
            {title}
          </h3>
        </Link>
        <div className="flex items-center gap-1 text-sm">
          <Star className="fill-amber-400 h-3.5 w-3.5 text-amber-400" />
          <span className="font-medium">{(rating ?? 0).toFixed(1)}</span>
        </div>
        <div className="mt-auto flex items-baseline gap-2 pt-1">
          <span className="text-lg font-bold tracking-tight">
            {formattedPrice}
          </span>
          {discountPercentage ? (
            <span className="text-muted-foreground text-xs line-through">
              {originalPrice}
            </span>
          ) : null}
        </div>
      </CardContent>

      <div className="p-4 pt-1">
        {outOfStock ? (
          <p className="text-destructive py-2 text-center text-sm font-medium">
            Out of stock
          </p>
        ) : isInCart ? (
          <GoToCartButton />
        ) : (
          <AddToCartButton
            productId={id}
            isAddingToCart={isAddingToCart}
            setIsAddingToCart={setIsAddingToCart}
          />
        )}
      </div>
    </Card>
  );
};

export default ProductsCard;
