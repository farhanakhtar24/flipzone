import { CardTitle } from "@/components/ui/card";
import { IorderedItemWithProduct } from "@/interfaces/actionInterface";
import { originalPriceGetter, priceFormatter } from "@/util/helper";
import Image from "next/image";
import Link from "next/link";
import React from "react";

type Props = {
  item: IorderedItemWithProduct;
};

const OrderedItem = ({ item }: Props) => {
  const { quantity } = item;
  const { title, price, thumbnail, discountPercentage } = item.product;
  const formattedPrice = priceFormatter(price);

  const originalPrice = originalPriceGetter(price, discountPercentage || 0);
  return (
    <Link href={`/products/${item.product.id}`}>
      <div className="flex flex-col gap-5 rounded border p-5 sm:flex-row">
        <Image
          src={thumbnail}
          alt={title}
          width={999}
          height={999}
          className="aspect-square h-auto w-full sm:w-[15%]"
        />
        <div className="flex w-[85%] flex-col justify-between">
          <p className="text-xl font-semibold">{title}</p>
          <div className="flex w-full flex-col gap-2">
            <p className="text-sm text-gray-600">Quantity: {quantity}</p>
            <div className="flex items-baseline gap-3">
              <CardTitle>{formattedPrice}</CardTitle>
              {originalPrice > 0 && (
                <p className="text-sm text-gray-500 line-through">
                  {originalPrice.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                  })}
                </p>
              )}
              {discountPercentage && (
                <p className="text-sm font-semibold text-green-700">
                  {discountPercentage}% off
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default OrderedItem;
