"use server";
import { db } from "@/db";
import { ApiResponse } from "@/interfaces/actionInterface";
import { Category } from "@prisma/client";

export const getAllCategories = async (): Promise<ApiResponse<Category[]>> => {
  try {
    // Fetch categories from the database
    const categories = await db.category.findMany();

    return {
      statusCode: 200,
      success: true,
      message: "Categories fetched successfully.",
      data: categories,
    };
  } catch (error) {
    console.error("Error fetching categories:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return {
      statusCode: 500,
      success: false,
      message: "Failed to fetch categories. Please try again later.",
      error: errorMessage,
    };
  }
};
