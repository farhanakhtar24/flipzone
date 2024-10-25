"use server";
import { db } from "@/db";
import { ApiResponse } from "@/interfaces/actionInterface";
import { ReviewSchema } from "@/schemas/product";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const addReview = async (
  values: z.infer<typeof ReviewSchema>,
): Promise<ApiResponse<null>> => {
  // Validate incoming data with Zod schema
  const validatedFields = ReviewSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      statusCode: 400,
      success: false,
      message: "Invalid review data!",
      error: validatedFields.error.message,
    };
  }

  // Destructure validated data
  const { rating, comment, reviewerName, reviewerEmail, productId } =
    validatedFields.data;

  try {
    // Begin a transaction
    const result = await db.$transaction(async (prisma) => {
      // Check if a similar review already exists to prevent duplicates
      const existingReview = await prisma.review.findFirst({
        where: {
          reviewerEmail,
          comment,
          productId,
        },
      });

      if (existingReview) {
        return {
          statusCode: 409,
          success: false,
          message: "A similar review already exists.",
        };
      }

      // Create the review record in the database
      await prisma.review.create({
        data: {
          rating,
          comment,
          reviewerName,
          reviewerEmail,
          product: {
            connect: {
              id: productId,
            }, // Link review to the product
          },
          date: new Date(),
        },
      });

      // Fetch all reviews for this product to calculate the new average rating
      const reviews = await prisma.review.findMany({
        where: {
          productId,
        },
        select: {
          rating: true,
        },
      });

      // Calculate the new average rating
      const totalRating = reviews.reduce(
        (acc, review) => acc + review.rating,
        0,
      );
      const averageRating = (totalRating / reviews.length).toFixed(2); // Round to 2 decimal places

      // Update the product with the new average rating
      await prisma.product.update({
        where: {
          id: productId,
        },
        data: {
          rating: parseFloat(averageRating),
        }, // Convert back to number
      });

      return {
        statusCode: 201,
        success: true,
        message: "Review added successfully, and product rating updated.",
      };
    });

    revalidatePath("/", "layout");

    return result;
  } catch (error) {
    console.error("Error adding review:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return {
      statusCode: 500,
      success: false,
      message: "Failed to add review. Please try again later.",
      error: errorMessage,
    };
  }
};
