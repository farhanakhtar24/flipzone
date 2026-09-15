import * as z from "zod";

export const WishlistItemSchema = z.object({
  productId: z.string().min(1, { message: "Product ID is required" }),
  wishListedItem: z.boolean(),
});

export const RemoveWishlistItemSchema = z.object({
  productId: z.string().min(1, { message: "Product ID is required" }),
});
