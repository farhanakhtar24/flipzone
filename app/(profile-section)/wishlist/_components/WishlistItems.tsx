import React from "react";
import Link from "next/link";
import { IWishlistSummary } from "@/interfaces/actionInterface";
import WishlistItemCard from "./WishlistItemCard";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PAGE_ROUTES } from "@/routes";

type WishlistItemsProps = {
  wishlist: IWishlistSummary;
};

const WishlistItems = ({ wishlist }: WishlistItemsProps) => {
  const { items } = wishlist;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <span className="bg-primary/10 text-primary flex h-16 w-16 items-center justify-center rounded-full">
          <Heart className="h-8 w-8" />
        </span>
        <div>
          <p className="text-lg font-semibold">Your wishlist is empty</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Tap the heart on any product to save it here for later.
          </p>
        </div>
        <Button asChild>
          <Link href={PAGE_ROUTES.PRODUCTS}>Browse bestsellers</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item) => (
        <WishlistItemCard key={item.id} item={item} />
      ))}
    </div>
  );
};

export default WishlistItems;
