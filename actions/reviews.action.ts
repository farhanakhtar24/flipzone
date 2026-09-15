"use server";
import { db } from "@/db";
import { ApiResponse } from "@/interfaces/actionInterface";
import {
  requireUser,
  serverErrorResponse,
  unauthorizedResponse,
} from "@/lib/auth-guard";
import { DeleteReviewSchema, ReviewSchema } from "@/schemas/product";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const addReview = async (
  values: z.infer<typeof ReviewSchema>,
): Promise<ApiResponse<null>> => {
  const session = await requireUser();
  if (!session) return unauthorizedResponse();

  const validatedFields = ReviewSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      statusCode: 400,
      success: false,
      message: "Invalid review data!",
      error: validatedFields.error.message,
    };
  }

  const { rating, comment, productId } = validatedFields.data;

  // Identity is always derived from the authenticated session
  const reviewerName = session.user.name ?? "Anonymous";
  const reviewerEmail = session.user.email ?? "";

  try {
    const result = await db.$transaction(async (prisma) => {
      const existingReview = await prisma.review.findFirst({
        where: {
          reviewerId: session.user.id,
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

      await prisma.review.create({
        data: {
          rating,
          comment,
          reviewerName,
          reviewerEmail,
          reviewer: {
            connect: {
              id: session.user.id,
            },
          },
          product: {
            connect: {
              id: productId,
            },
          },
          date: new Date(),
        },
      });

      const reviews = await prisma.review.findMany({
        where: {
          productId,
        },
        select: {
          rating: true,
        },
      });

      const totalRating = reviews.reduce(
        (acc, review) => acc + review.rating,
        0,
      );
      const averageRating = (totalRating / reviews.length).toFixed(2);

      await prisma.product.update({
        where: {
          id: productId,
        },
        data: {
          rating: parseFloat(averageRating),
        },
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
    return serverErrorResponse(
      "Failed to add review. Please try again later.",
    );
  }
};

export const editReview = async (
  values: z.infer<typeof ReviewSchema>,
): Promise<ApiResponse<null>> => {
  const session = await requireUser();
  if (!session) return unauthorizedResponse();

  const validatedFields = ReviewSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      statusCode: 400,
      success: false,
      message: "Invalid review data!",
      error: validatedFields.error.message,
    };
  }

  const { rating, comment, productId, reviewId } = validatedFields.data;

  try {
    const result = await db.$transaction(async (prisma) => {
      const existingReview = await prisma.review.findUnique({
        where: { id: reviewId },
      });

      // Ownership is decided by the server-side session, not client input
      if (!existingReview || existingReview.reviewerId !== session.user.id) {
        return {
          statusCode: 404,
          success: false,
          message: "Review not found or you're not authorized to edit it.",
        };
      }

      await prisma.review.update({
        where: { id: reviewId },
        data: {
          rating,
          comment,
        },
      });

      const reviews = await prisma.review.findMany({
        where: { productId },
        select: { rating: true },
      });

      const totalRating = reviews.reduce(
        (acc, review) => acc + review.rating,
        0,
      );
      const averageRating = (totalRating / reviews.length).toFixed(2);

      await prisma.product.update({
        where: { id: productId },
        data: {
          rating: parseFloat(averageRating),
        },
      });

      return {
        statusCode: 200,
        success: true,
        message:
          "Review updated successfully and product rating recalculated.",
      };
    });

    revalidatePath("/", "layout");

    return result;
  } catch (error) {
    console.error("Error editing review:", error);
    return serverErrorResponse(
      "Failed to edit review. Please try again later.",
    );
  }
};

export const deleteReview = async (values: {
  reviewId: string;
  productId: string;
}): Promise<ApiResponse<null>> => {
  const session = await requireUser();
  if (!session) return unauthorizedResponse();

  const validatedFields = DeleteReviewSchema.safeParse(values);
  if (!validatedFields.success) {
    return {
      statusCode: 400,
      success: false,
      message: "Invalid review data.",
    };
  }

  const { productId, reviewId } = validatedFields.data;

  try {
    const result = await db.$transaction(async (prisma) => {
      const existingReview = await prisma.review.findUnique({
        where: { id: reviewId },
      });

      if (!existingReview || existingReview.reviewerId !== session.user.id) {
        return {
          statusCode: 404,
          success: false,
          message: "Review not found or you're not authorized to delete it.",
        };
      }

      await prisma.review.delete({
        where: { id: reviewId },
      });

      const remainingReviews = await prisma.review.findMany({
        where: { productId },
        select: { rating: true },
      });

      let averageRating = 0;
      if (remainingReviews.length > 0) {
        const totalRating = remainingReviews.reduce(
          (acc, review) => acc + review.rating,
          0,
        );
        averageRating = parseFloat(
          (totalRating / remainingReviews.length).toFixed(2),
        );
      }

      await prisma.product.update({
        where: { id: productId },
        data: {
          rating: averageRating,
        },
      });

      return {
        statusCode: 200,
        success: true,
        message: "Review deleted successfully, and product rating updated.",
      };
    });
    revalidatePath("/", "layout");

    return result;
  } catch (error) {
    console.error("Error deleting review:", error);
    return serverErrorResponse(
      "Failed to delete review. Please try again later.",
    );
  }
};
