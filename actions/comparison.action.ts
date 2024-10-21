"use server";

import { db } from "@/db";
import { ApiResponse } from "@/interfaces/actionInterface";
import { revalidatePath } from "next/cache";

export const addProductToComparison = async ({
  productId,
  userId,
  isCompared,
}: {
  productId: string;
  userId: string;
  isCompared: boolean;
}): Promise<ApiResponse<null>> => {
  try {
    // Check if there is an existing comparison list for the user
    const comparisonList = await db.comparison.findUnique({
      where: {
        userId,
      },
      include: {
        items: true,
      },
    });

    if (isCompared) {
      // If isCompared is true, add the product to the comparison list
      if (!comparisonList) {
        // If no comparison list exists, create one and add the product
        await db.comparison.create({
          data: {
            userId,
            items: {
              create: {
                productId,
              },
            },
          },
        });
      } else {
        // Check if the product is already in the comparison list
        const isProductInComparison = comparisonList.items.some(
          (item) => item.productId === productId,
        );

        if (!isProductInComparison) {
          // If the product is not in the comparison list, add it
          await db.comparison.update({
            where: {
              userId,
            },
            data: {
              items: {
                create: {
                  productId,
                },
              },
            },
          });
        } else {
          return {
            success: true,
            message: "Product is already in the comparison list",
            statusCode: 200,
          };
        }
      }
    } else {
      // If isCompared is false, remove the product from the comparison list
      if (comparisonList) {
        // Check if the product exists in the comparison list
        const isProductInComparison = comparisonList.items.some(
          (item) => item.productId === productId,
        );

        if (isProductInComparison) {
          // Remove the product from the comparison list
          await db.comparisonItem.deleteMany({
            where: {
              productId,
              comparisonId: comparisonList.id,
            },
          });

          // Check if the comparison list is empty after removal
          const updatedComparisonList = await db.comparison.findUnique({
            where: {
              userId,
            },
            include: {
              items: true,
            },
          });

          // If the comparison list is empty, delete the list itself
          if (
            updatedComparisonList &&
            updatedComparisonList.items.length === 0
          ) {
            await db.comparison.delete({
              where: {
                userId,
              },
            });
          }
        } else {
          return {
            success: true,
            message: "Product not found in the comparison list",
            statusCode: 404,
          };
        }
      } else {
        return {
          success: true,
          message: "No comparison list found for the user",
          statusCode: 404,
        };
      }
    }

    revalidatePath("/", "layout");

    return {
      success: true,
      message: isCompared
        ? "Product added to comparison list"
        : "Product removed from comparison list",
      statusCode: 200,
    };
  } catch (error) {
    console.error("Error updating comparison list:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";

    return {
      statusCode: 500,
      success: false,
      message: "Failed to update comparison list. Please try again later.",
      error: errorMessage,
    };
  }
};
