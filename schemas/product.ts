import * as z from "zod";

export const ReviewSchema = z.object({
  rating: z
    .number()
    .int()
    .min(1, { message: "Rating must be at least 1" })
    .max(5, { message: "Rating must be no more than 5" }),
  comment: z
    .string()
    .min(1, { message: "Comment cannot be empty" })
    .max(500, { message: "Comment cannot exceed 500 characters" }),
  reviewerName: z
    .string()
    .min(1, { message: "Reviewer name is required" })
    .max(100, { message: "Reviewer name cannot exceed 100 characters" }),
  reviewerEmail: z.string().email({ message: "Invalid email address" }),
  productId: z.string({
    required_error: "Product ID is required",
    invalid_type_error: "Product ID must be a string",
  }),
});
