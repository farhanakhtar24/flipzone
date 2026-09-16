"use client";
import { moveToCart } from "@/actions/cart.action";
import { removeWishlistItem } from "@/actions/wishlist.action";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import Spinner from "@/components/ui/spinner";
import { useCartDrawer } from "@/context/CartDrawerContext";
import { useToast } from "@/hooks/use-toast";
import { IWishlistItemWithProduct } from "@/interfaces/actionInterface";
import { originalPriceGetter, priceFormatter } from "@/util/helper";
import { ShoppingCart } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
import { MdDeleteOutline } from "react-icons/md";

type WishlistItemCardProps = {
  item: IWishlistItemWithProduct;
};

const WishlistItemCard = ({ item }: WishlistItemCardProps) => {
  const { toast } = useToast();
  const { setOpen } = useCartDrawer();

  const { thumbnail, title, price, discountPercentage } = item.product;
  const formattedPrice = priceFormatter(price);

  const originalPrice = originalPriceGetter(price, discountPercentage || 0);

  const [loading, setLoading] = useState(false);
  const [moving, setMoving] = useState(false);

  const handleDelete = async () => {
    setLoading(true);

    const { message, error } = await removeWishlistItem({
      productId: item.product.id,
    });

    setLoading(false);

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

  const handleMoveToCart = async () => {
    setMoving(true);
    const { message, error } = await moveToCart({ productId: item.product.id });
    setMoving(false);

    if (error) {
      toast({
        title: message,
        description: error,
        variant: "destructive",
      });
      return;
    }
    if (message) {
      toast({ title: message, variant: "success" });
    }
    setOpen(true);
  };

  return (
    <Card className="flex h-full w-full flex-col gap-5 p-5">
      <Image
        src={thumbnail}
        alt={title}
        width={999}
        height={999}
        className="w-full object-cover"
      />
      <div className="flex h-full flex-col space-y-2">
        <p className="flex flex-grow flex-col gap-1 text-base font-semibold">
          {title}
        </p>
        <div className="flex items-baseline gap-3">
          <CardTitle className="text-xl font-bold">{formattedPrice}</CardTitle>
          <p className="text-sm text-muted-foreground line-through">
            {originalPrice}
          </p>
          {discountPercentage && (
            <p className="text-xs font-semibold text-green-700">
              {discountPercentage}% off
            </p>
          )}
        </div>
      </div>
      <div className="flex w-full items-center justify-center gap-2">
        <Button
          variant="default"
          className="flex-1"
          onClick={handleMoveToCart}
          disabled={moving || loading}
        >
          {moving ? (
            <div className="h-4 w-4">
              <Spinner className="text-white" />
            </div>
          ) : (
            <>
              <ShoppingCart className="mr-1 h-4 w-4" />
              Move to cart
            </>
          )}
        </Button>
        <Button
          variant="destructive"
          size="icon"
          onClick={handleDelete}
          disabled={moving || loading}
          aria-label="Remove from wishlist"
        >
          {loading ? (
            <div className="h-5 w-5">
              <Spinner className="text-white" />
            </div>
          ) : (
            <MdDeleteOutline className="h-5 w-5" />
          )}
        </Button>
      </div>
    </Card>
  );
};

export default WishlistItemCard;
