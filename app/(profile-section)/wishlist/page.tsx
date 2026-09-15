import { getWishlistByUserId } from "@/actions/wishlist.action";
import { auth } from "@/auth";
import React from "react";
import WishlistItems from "./_components/WishlistItems";

export const dynamic = "force-dynamic";

const page = async () => {
  const session = await auth();

  if (!session?.user?.id) {
    return <div>User not found</div>;
  }

  const { data, error, message } = await getWishlistByUserId();

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        {message}
      </div>
    );
  }

  return <WishlistItems wishlist={data} />;
};

export default page;
