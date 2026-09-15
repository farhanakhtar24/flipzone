"use server";
import { db } from "@/db";
import { ApiResponse } from "@/interfaces/actionInterface";
import { serverErrorResponse } from "@/lib/auth-guard";
import { Category } from "@prisma/client";

export const getAllCategories = async (): Promise<ApiResponse<Category[]>> => {
  try {
    const categories = await db.category.findMany({
      orderBy: { name: "asc" },
    });

    return {
      statusCode: 200,
      success: true,
      message: "Categories fetched successfully.",
      data: categories,
    };
  } catch (error) {
    console.error("Error fetching categories:", error);
    return serverErrorResponse(
      "Failed to fetch categories. Please try again later.",
    );
  }
};

export const getAllBrands = async (): Promise<ApiResponse<string[]>> => {
  try {
    const brands = await db.product.findMany({
      where: { brand: { not: null } },
      select: { brand: true },
      distinct: ["brand"],
      orderBy: { brand: "asc" },
    });

    const brandNames = brands
      .map((b) => b.brand)
      .filter((b): b is string => b !== null);

    return {
      statusCode: 200,
      success: true,
      message: "Brands fetched successfully.",
      data: brandNames,
    };
  } catch (error) {
    console.error("Error fetching brands:", error);
    return serverErrorResponse("Failed to fetch brands. Please try again later.");
  }
};
