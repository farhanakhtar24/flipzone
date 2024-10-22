"use client";
import { updateCartItemQuantity } from "@/actions/cart.action";
import RatingBox from "@/components/RatingBox/RatingBox";
import { Button } from "@/components/ui/button";
import { CardContent, CardTitle } from "@/components/ui/card";
import Spinner from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";
import { IcartItemWithProduct } from "@/interfaces/actionInterface";
import { originalPriceGetter, priceFormatter } from "@/util/helper";
import Image from "next/image";
import React, { useState } from "react";
import { FiMinus } from "react-icons/fi";
import { GoPlus } from "react-icons/go";

type Props = {
  item: IcartItemWithProduct;
};

const CartItem = ({ item }: Props) => {
  const { toast } = useToast();
  const { product, quantity, id: cartItemId } = item;

  const [loading, setLoading] = useState(false);

  let { title, thumbnail, price, discountPercentage, stock, rating } = product;

  title = title ?? "";
  thumbnail = thumbnail ?? "";
  price = price ?? 0;
  discountPercentage = discountPercentage ?? 0;
  stock = stock ?? 0;
  rating = rating ?? 0;

  const formattedPrice = priceFormatter(price);
  const originalPrice = originalPriceGetter(price, discountPercentage);

  const handleQuantityUpdate = async (quantity: number) => {
    const { message, error } = await updateCartItemQuantity(
      cartItemId,
      quantity,
    );

    if (error) {
      toast({
        title: message,
        description: error,
        variant: "destructive",
      });
    } else if (message) {
      toast({
        title: message,
        variant: "success",
      });
    }
  };

  return (
    <CardContent className="flex w-full flex-col gap-3 p-6">
      <div className="flex flex-col gap-5 md:flex-row">
        <Image
          src={thumbnail}
          alt={title}
          width={999}
          height={999}
          className="w-full md:w-[15%]"
        />
        <div className="flex w-full flex-col justify-between md:w-[85%]">
          <p className="text-xl font-semibold">{title}</p>
          <div className="flex w-full flex-col gap-2">
            <p className="text-sm text-gray-600">In Stock: {stock}</p>
            <div className="flex items-baseline gap-3">
              <CardTitle className="text-2xl">{formattedPrice}</CardTitle>
              <p className="text-sm text-gray-500 line-through">
                {originalPrice}
              </p>
              {discountPercentage && (
                <p className="text-sm font-semibold text-green-700">
                  {discountPercentage}% off
                </p>
              )}
              <RatingBox rating={rating} />
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex w-[20%] items-center justify-start gap-2 xl:w-[15%] xl:justify-center">
          <button
            className="flex aspect-square h-7 w-7 cursor-pointer items-center justify-center rounded-full border hover:bg-gray-100"
            onClick={() => handleQuantityUpdate(-1)}
          >
            <FiMinus />
          </button>
          <input
            type="number"
            value={quantity}
            className="w-12 rounded border text-center"
            readOnly
          />
          <button
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => handleQuantityUpdate(1)}
          >
            <GoPlus />
          </button>
        </div>
        <Button
          className="justify-centers flex min-w-28 items-center bg-red-700 hover:bg-red-500"
          onClick={async () => {
            setLoading(true);
            await handleQuantityUpdate(-quantity);
            setLoading(false);
          }}
          disabled={loading}
        >
          {loading ? (
            <div className="h-5 w-5">
              <Spinner className="text-white" />
            </div>
          ) : (
            <>Remove</>
          )}
        </Button>
      </div>
    </CardContent>
  );
};

export default CartItem;
