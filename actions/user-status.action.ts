"use server";

import { db } from "@/db";
import { ApiResponse } from "@/interfaces/actionInterface";
import { requireUser, unauthorizedResponse } from "@/lib/auth-guard";

export type UserProductStatus = {
  cartIds: string[];
  wishlistIds: string[];
};

/**
 * The set of product Ids the signed-in user already has in their cart or
 * wishlist. Fetching this once per page (instead of embedding per-user
 * `Include` filters into every catalog query) is what lets the catalog be
 * cached/shared across users — personalization stays on top.
 */
export const getCartAndWishlistIds = async (): Promise<
  ApiResponse<UserProductStatus>
> => {
  const session = await requireUser();
  if (!session) return unauthorizedResponse();

  const userId = session.user.id;

  const [cart, wishlist] = await Promise.all([
    db.cart.findUnique({
      where: { userId },
      select: { items: { select: { productId: true } } },
    }),
    db.wishlist.findUnique({
      where: { userId },
      select: { items: { select: { productId: true } } },
    }),
  ]);

  return {
    statusCode: 200,
    success: true,
    message: "User product status fetched.",
    data: {
      cartIds: cart?.items.map((i) => i.productId) ?? [],
      wishlistIds: wishlist?.items.map((i) => i.productId) ?? [],
    },
  };
};
