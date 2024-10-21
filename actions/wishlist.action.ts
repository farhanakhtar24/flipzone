"use server";

import { db } from "@/db";
import { ApiResponse } from "@/interfaces/actionInterface";
import { revalidatePath } from "next/cache";

export const wishlistItem = async ({
  productId,
  userId,
  wishListedItem,
}: {
  productId: string;
  userId: string;
  wishListedItem: boolean;
}): Promise<ApiResponse<null>> => {
  try {
    // Check if there is an existing wishlist for the user
    const wishlist = await db.wishlist.findUnique({
      where: {
        userId,
      },
      include: {
        items: true,
      },
    });

    if (wishListedItem) {
      // If wishListedItem is true, add the product to the wishlist
      if (!wishlist) {
        // If no wishlist exists, create one and add the product
        await db.wishlist.create({
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
        // Check if the product is already in the wishlist
        const isProductInWishlist = wishlist.items.some(
          (item) => item.productId === productId,
        );

        if (!isProductInWishlist) {
          // If the product is not in the wishlist, add it
          await db.wishlist.update({
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
            message: "Product is already in the wishlist",
            statusCode: 200,
          };
        }
      }
    } else {
      // If wishListedItem is false, remove the product from the wishlist
      if (wishlist) {
        // Check if the product exists in the wishlist
        const isProductInWishlist = wishlist.items.some(
          (item) => item.productId === productId,
        );

        if (isProductInWishlist) {
          // Remove the product from the wishlist
          await db.wishlistItem.deleteMany({
            where: {
              productId,
              wishlistId: wishlist.id,
            },
          });

          // If the wishlist is empty after removal, delete the wishlist itself
          const updatedWishlist = await db.wishlist.findUnique({
            where: {
              userId,
            },
            include: {
              items: true,
            },
          });

          if (updatedWishlist && updatedWishlist.items.length === 0) {
            await db.wishlist.delete({
              where: {
                userId,
              },
            });
          }
        } else {
          return {
            success: true,
            message: "Product not found in the wishlist",
            statusCode: 404,
          };
        }
      } else {
        return {
          success: true,
          message: "No wishlist found for the user",
          statusCode: 404,
        };
      }
    }

    revalidatePath("/", "layout");

    return {
      success: true,
      message: wishListedItem
        ? "Product added to wishlist"
        : "Product removed from wishlist",
      statusCode: 200,
    };
  } catch (error) {
    console.error("Error updating wishlist:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";

    return {
      statusCode: 500,
      success: false,
      message: "Failed to update wishlist. Please try again later.",
      error: errorMessage,
    };
  }
};
