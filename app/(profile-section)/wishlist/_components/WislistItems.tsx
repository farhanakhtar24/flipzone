import React from "react";
import { IWishlistSummary } from "@/interfaces/actionInterface";
import WishlistItemCard from "./WishlistItemCard";

type WishlistItemsProps = {
  wishlist: IWishlistSummary;
};

const WishlistItems = ({ wishlist }: WishlistItemsProps) => {
  const { items, wishlistId } = wishlist;

  return (
    <div className="flex h-fit w-full flex-col items-center justify-center">
      <div className="grid h-full w-full grid-cols-4 gap-5 p-5">
        {items.map((item) => (
          <WishlistItemCard key={item.id} item={item} wishlistId={wishlistId} />
        ))}
      </div>
    </div>
  );
};

export default WishlistItems;
