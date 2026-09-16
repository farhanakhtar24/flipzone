"use client";
import React, { useState } from "react";
import { saveForLater, updateCartItemQuantity } from "@/actions/cart.action";
import RatingBox from "@/components/RatingBox/RatingBox";
import { Button } from "@/components/ui/button";
import { CardContent, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { IcartItemWithProduct } from "@/interfaces/actionInterface";
import { originalPriceGetter, priceFormatter } from "@/util/helper";
import { Bookmark } from "lucide-react";
import Image from "next/image";
import { QuantitySelectorInputs, RemoveItemButton } from "./CartButtons";

type Props = {
  item: IcartItemWithProduct;
};

const CartItem = ({ item }: Props) => {
  const { toast } = useToast();
  const { product, quantity, id: cartItemId } = item;
  const [isSaving, setIsSaving] = useState(false);

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
    const { message, error } = await updateCartItemQuantity({
      cartItemId,
      quantityChange: quantity,
    });

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

  const handleSaveForLater = async () => {
    setIsSaving(true);
    const { message, error } = await saveForLater({ cartItemId });
    setIsSaving(false);

    if (error) {
      toast({
        title: message,
        description: error,
        variant: "destructive",
      });
    } else if (message) {
      toast({ title: message, variant: "success" });
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
            <p className="text-sm text-muted-foreground">In Stock: {stock}</p>
            <div className="flex items-baseline gap-3">
              <CardTitle className="text-2xl">{formattedPrice}</CardTitle>
              <p className="text-sm text-muted-foreground line-through">
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
      <div className="flex items-center justify-between gap-2">
        <QuantitySelectorInputs
          quantity={quantity}
          handleQuantityUpdate={handleQuantityUpdate}
          stock={stock}
        />
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSaveForLater}
            disabled={isSaving}
            className="text-muted-foreground hover:text-foreground"
          >
            <Bookmark className="mr-1 h-4 w-4" />
            Save for later
          </Button>
          <RemoveItemButton
            handleQuantityUpdate={handleQuantityUpdate}
            quantity={quantity}
          />
        </div>
      </div>
    </CardContent>
  );
};

export default CartItem;
