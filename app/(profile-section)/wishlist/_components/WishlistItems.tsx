import React from "react";
import { IWishlistSummary } from "@/interfaces/actionInterface";
import WishlistItemCard from "./WishlistItemCard";
import { Heart } from "lucide-react";

type WishlistItemsProps = {
  wishlist: IWishlistSummary;
};

const WishlistItems = ({ wishlist }: WishlistItemsProps) => {
  const { items } = wishlist;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 p-20 text-center">
        <Heart className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">Your wishlist is empty.</p>
      </div>
    );
  }

  return (
    <div className="flex h-fit w-full flex-col items-center justify-center">
      <div className="grid h-full w-full grid-cols-1 gap-5 p-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => (
          <WishlistItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};

export default WishlistItems;
