"use server";

import { db } from "@/db";
import { ApiResponse } from "@/interfaces/actionInterface";
import {
  requireUser,
  serverErrorResponse,
  unauthorizedResponse,
} from "@/lib/auth-guard";
import { IWishlistSummary } from "@/interfaces/actionInterface";
import {
  RemoveWishlistItemSchema,
  WishlistItemSchema,
} from "@/schemas/wishlist";
import { revalidatePath } from "next/cache";

export const getWishlistByUserId = async (): Promise<
  ApiResponse<IWishlistSummary>
> => {
  const session = await requireUser();
  if (!session) return unauthorizedResponse();

  const userId = session.user.id;

  try {
    const wishlist = await db.wishlist.findUnique({
      where: {
        userId,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!wishlist) {
      return {
        statusCode: 404,
        success: false,
        message: "Wishlist not found.",
      };
    }

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
    return serverErrorResponse(
      "Failed to fetch the wishlist. Please try again later.",
    );
  }
};

export const wishlistItem = async (values: {
  productId: string;
  wishListedItem: boolean;
}): Promise<ApiResponse<null>> => {
  const session = await requireUser();
  if (!session) return unauthorizedResponse();

  const userId = session.user.id;

  const validatedFields = WishlistItemSchema.safeParse(values);
  if (!validatedFields.success) {
    return {
      statusCode: 400,
      success: false,
      message: "Invalid wishlist data.",
    };
  }

  const { productId, wishListedItem } = validatedFields.data;

  try {
    const wishlist = await db.wishlist.findUnique({
      where: {
        userId,
      },
      include: {
        items: true,
      },
    });

    if (wishListedItem) {
      if (!wishlist) {
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
        const isProductInWishlist = wishlist.items.some(
          (item) => item.productId === productId,
        );

        if (!isProductInWishlist) {
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
      if (wishlist) {
        const isProductInWishlist = wishlist.items.some(
          (item) => item.productId === productId,
        );

        if (isProductInWishlist) {
          await db.wishlistItem.deleteMany({
            where: {
              productId,
              wishlistId: wishlist.id,
            },
          });

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
        }
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
    return serverErrorResponse(
      "Failed to update wishlist. Please try again later.",
    );
  }
};

export const removeWishlistItem = async (values: {
  productId: string;
}): Promise<ApiResponse<null>> => {
  const session = await requireUser();
  if (!session) return unauthorizedResponse();

  const userId = session.user.id;

  const validatedFields = RemoveWishlistItemSchema.safeParse(values);
  if (!validatedFields.success) {
    return {
      statusCode: 400,
      success: false,
      message: "Invalid wishlist data.",
    };
  }

  const { productId } = validatedFields.data;

  try {
    const result = await db.$transaction(async (prisma) => {
      // Scope the operation to the user's own wishlist
      const wishlist = await prisma.wishlist.findUnique({
        where: {
          userId,
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

      const existingWishlistItem = await prisma.wishlistItem.findFirst({
        where: {
          wishlistId: wishlist.id,
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

      // If this is the last item, remove the wishlist entirely
      if (wishlist.items.length === 1) {
        await prisma.wishlist.delete({
          where: {
            id: wishlist.id,
          },
        });

        return {
          statusCode: 200,
          success: true,
          message: "Product removed from wishlist.",
        };
      }

      await prisma.wishlistItem.delete({
        where: {
          id: existingWishlistItem.id,
        },
      });

      return {
        statusCode: 200,
        success: true,
        message: "Product removed from wishlist.",
      };
    });

    revalidatePath("/", "layout");

    return result;
  } catch (error) {
    console.error("Error removing product from wishlist:", error);
    return serverErrorResponse(
      "Failed to remove product from wishlist. Please try again later.",
    );
  }
};
