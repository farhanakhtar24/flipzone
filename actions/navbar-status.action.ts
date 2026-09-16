"use server";

import { db } from "@/db";
import { ApiResponse } from "@/interfaces/actionInterface";
import { requireUser, unauthorizedResponse } from "@/lib/auth-guard";

/**
 * Badge counts for the navbar cart/wishlist icons. Single round trip, counts
 * only — no product payloads. Re-runs on every page load since Navbar is a
 * server component inside the dynamic layout.
 */
export const getNavbarCounts = async (): Promise<
  ApiResponse<{ cartCount: number; wishlistCount: number }>
> => {
  const session = await requireUser();
  if (!session) return unauthorizedResponse();

  const userId = session.user.id;

  const [cartCount, wishlistCount] = await Promise.all([
    db.cartItem.count({ where: { cart: { userId } } }),
    db.wishlistItem.count({ where: { wishlist: { userId } } }),
  ]);

  return {
    statusCode: 200,
    success: true,
    message: "Navbar counts fetched.",
    data: { cartCount, wishlistCount },
  };
};
