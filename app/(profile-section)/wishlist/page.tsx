import { getWishlistByUserId } from "@/actions/wishlist.action";
import { auth } from "@/auth";
import React from "react";
import WislistItems from "./_components/WislistItems";

const page = async () => {
  const session = await auth();

  if (!session?.user?.id) {
    return <div>User not found</div>;
  }

  const { data, error, message } = await getWishlistByUserId(session.user.id);

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

  if (message) {
    console.log("message :", message);
  }

  console.log({ data });

  return <WislistItems wishlist={data} />;
};

export default page;
