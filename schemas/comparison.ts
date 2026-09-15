import * as z from "zod";

export const ComparisonItemSchema = z.object({
  productId: z.string().min(1, { message: "Product ID is required" }),
  isCompared: z.boolean(),
});
