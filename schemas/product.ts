import * as z from "zod";

/**
 * Review payload accepted from the client. Reviewer identity is
 * derived from the server-side session — never trusted from the client.
 */
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
  productId: z.string({
    required_error: "Product ID is required",
    invalid_type_error: "Product ID must be a string",
  }),
  reviewId: z.string().optional(),
});

export const DeleteReviewSchema = z.object({
  reviewId: z.string().min(1),
  productId: z.string().min(1),
});
