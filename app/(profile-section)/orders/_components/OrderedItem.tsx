import { CardTitle } from "@/components/ui/card";
import { IorderedItemWithProduct } from "@/interfaces/actionInterface";
import { priceFormatter } from "@/util/helper";
import Image from "next/image";
import Link from "next/link";
import React from "react";

type Props = {
  item: IorderedItemWithProduct;
};

const OrderedItem = ({ item }: Props) => {
  const { quantity, unitPrice, title, thumbnail } = item;

  return (
    <Link href={`/products/${item.productId}`}>
      <div className="flex flex-col gap-5 rounded border p-5 sm:flex-row">
        {thumbnail && (
          <Image
            src={thumbnail}
            alt={title}
            width={120}
            height={120}
            className="aspect-square h-auto w-full rounded object-cover sm:w-[15%]"
          />
        )}
        <div className="flex w-full flex-col justify-between sm:w-[85%]">
          <p className="text-xl font-semibold">{title}</p>
          <div className="flex w-full flex-col gap-2">
            <p className="text-sm text-muted-foreground">
              Quantity: {quantity}
            </p>
            <div className="flex items-baseline gap-3">
              <CardTitle>{priceFormatter(unitPrice)}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {priceFormatter(unitPrice * quantity)} total
              </p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default OrderedItem;
