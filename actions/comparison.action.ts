"use server";

import { db } from "@/db";
import { ApiResponse } from "@/interfaces/actionInterface";
import {
  requireUser,
  serverErrorResponse,
  unauthorizedResponse,
} from "@/lib/auth-guard";
import { ComparisonItemSchema } from "@/schemas/comparison";
import { revalidatePath } from "next/cache";

const MAX_COMPARISON_ITEMS = 4;

export const addProductToComparison = async (values: {
  productId: string;
  isCompared: boolean;
}): Promise<ApiResponse<null>> => {
  const session = await requireUser();
  if (!session) return unauthorizedResponse();

  const userId = session.user.id;

  const validatedFields = ComparisonItemSchema.safeParse(values);
  if (!validatedFields.success) {
    return {
      statusCode: 400,
      success: false,
      message: "Invalid comparison data.",
    };
  }

  const { productId, isCompared } = validatedFields.data;

  try {
    const comparisonList = await db.comparison.findUnique({
      where: {
        userId,
      },
      include: {
        items: true,
      },
    });

    if (isCompared) {
      if (!comparisonList) {
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
        const isProductInComparison = comparisonList.items.some(
          (item) => item.productId === productId,
        );

        if (isProductInComparison) {
          return {
            success: true,
            message: "Product is already in the comparison list",
            statusCode: 200,
          };
        }

        if (comparisonList.items.length >= MAX_COMPARISON_ITEMS) {
          return {
            statusCode: 400,
            success: false,
            message: `You can compare up to ${MAX_COMPARISON_ITEMS} products.`,
          };
        }

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
      }
    } else {
      if (comparisonList) {
        const isProductInComparison = comparisonList.items.some(
          (item) => item.productId === productId,
        );

        if (isProductInComparison) {
          await db.comparisonItem.deleteMany({
            where: {
              productId,
              comparisonId: comparisonList.id,
            },
          });

          const updatedComparisonList = await db.comparison.findUnique({
            where: {
              userId,
            },
            include: {
              items: true,
            },
          });

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
        }
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
    return serverErrorResponse(
      "Failed to update comparison list. Please try again later.",
    );
  }
};
