"use server";

import { db } from "@/db";
import { ApiResponse } from "@/interfaces/actionInterface";
import { revalidatePath } from "next/cache";
import { IWishlistSummary } from "@/interfaces/actionInterface";

export const getWishlistByUserId = async (userId: string) => {
  try {
    // Fetch the user's wishlist from the database, including items and their associated products
    const wishlist = await db.wishlist.findUnique({
      where: {
        userId,
      },
      include: {
        items: {
          include: {
            product: true, // Include product details for each wishlist item
          },
        },
      },
    });

    if (!wishlist) {
      return {
        statusCode: 404,
        success: false,
        message: "Wishlist not found for the given user.",
      };
    }

    // Create an wishlist summary to return in the response
    const wishlistSummary: IWishlistSummary = {
      wishlistId: wishlist.id,
      items: wishlist.items,
    };

    return {
      statusCode: 200,
      success: true,
      message: "Wishlist fetched successfully.",
      data: wishlistSummary,
    };
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return {
      statusCode: 500,
      success: false,
      message: "Failed to fetch the wishlist. Please try again later.",
      error: errorMessage,
    };
  }
};

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

export const removeWishlistItem = async ({
  wishlistId,
  productId,
}: {
  wishlistId: string;
  productId: string;
}): Promise<ApiResponse<null>> => {
  try {
    // Start a transaction
    const result = await db.$transaction(async (prisma) => {
      // Check if the wishlist exists
      const wishlist = await prisma.wishlist.findUnique({
        where: {
          id: wishlistId,
        },
        include: {
          items: true,
        },
      });

      if (!wishlist) {
        return {
          statusCode: 404,
          success: false,
          message: "Wishlist not found.",
        };
      }

      // if there is only one item in the wishlist, delete the wishlist itself
      if (wishlist.items.length === 1) {
        await prisma.wishlist.delete({
          where: {
            id: wishlistId,
          },
        });

        return {
          statusCode: 200,
          success: true,
          message: "Wishlist and product removed.",
        };
      } else {
        // Check if the product exists in the wishlist
        const existingWishlistItem = await prisma.wishlistItem.findFirst({
          where: {
            wishlistId,
            productId,
          },
        });

        if (!existingWishlistItem) {
          return {
            statusCode: 404,
            success: false,
            message: "Product not found in the wishlist.",
          };
        }

        // Otherwise, update the wishlist to remove the product
        await prisma.wishlist.update({
          where: {
            id: wishlistId,
          },
          data: {
            items: {
              delete: {
                id: existingWishlistItem.id,
              },
            },
          },
        });

        return {
          statusCode: 200,
          success: true,
          message: "Product removed from wishlist.",
        };
      }
    });

    revalidatePath("/", "layout");

    return result;
  } catch (error) {
    console.error("Error removing product from wishlist:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return {
      statusCode: 500,
      success: false,
      message:
        "Failed to remove product from wishlist. Please try again later.",
      error: errorMessage,
    };
  }
};
