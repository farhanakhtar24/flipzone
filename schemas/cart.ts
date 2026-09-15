import * as z from "zod";

export const AddToCartSchema = z.object({
  productId: z.string().min(1, { message: "Product ID is required" }),
});

export const UpdateCartItemQuantitySchema = z.object({
  cartItemId: z.string().min(1, { message: "Cart item ID is required" }),
  quantityChange: z
    .number()
    .int({ message: "Quantity change must be an integer" })
    .min(-100, { message: "Invalid quantity change" })
    .max(100, { message: "Invalid quantity change" })
    .refine((value) => value !== 0, { message: "Quantity change cannot be 0" }),
});
