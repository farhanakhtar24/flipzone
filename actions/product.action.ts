"use server";
import { db } from "@/db";
import { ApiResponse } from "@/interfaces/actionInterface";
import { Product } from "@prisma/client";

export const getAllProducts = async (): Promise<ApiResponse<Product[]>> => {
  try {
    const products = await db.product.findMany();
    return {
      statusCode: 200,
      success: true,
      message: "Products fetched successfully.",
      data: products,
    };
  } catch (error) {
    console.error(error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return {
      statusCode: 500,
      success: false,
      message: "Failed to fetch products. Please try again later.",
      error: errorMessage,
    };
  }
};

export async function addToCart({
  userId,
  productId,
  quantity = 1,
}: {
  userId: string;
  productId: string;
  quantity?: number;
}): Promise<ApiResponse<null>> {
  try {
    // Start a transaction to ensure data consistency
    await db.$transaction(async (prisma) => {
      // Check if the user already has a cart
      let cart = await prisma.cart.findUnique({
        where: {
          userId,
        },
      });

      // If no cart exists, create one
      if (!cart) {
        cart = await prisma.cart.create({
          data: {
            userId,
            items: {
              create: {
                productId,
                quantity,
              },
            },
          },
        });
      } else {
        // If the cart exists, check if the product is already in the cart
        const existingCartItem = await prisma.cartItem.findFirst({
          where: {
            cartId: cart.id,
            productId,
          },
        });

        if (existingCartItem) {
          // If the product is already in the cart, just update the quantity
          await prisma.cartItem.update({
            where: {
              id: existingCartItem.id,
            },
            data: {
              quantity: existingCartItem.quantity + quantity,
            },
          });
        } else {
          // If the product is not in the cart, create a new cart item
          await prisma.cartItem.create({
            data: {
              cartId: cart.id,
              productId,
              quantity,
            },
          });
        }
      }
    });

    return {
      statusCode: 200,
      success: true,
      message: "Product added to cart successfully.",
    };
  } catch (error) {
    console.error("Error adding product to cart:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";

    return {
      statusCode: 500,
      success: false,
      message: "Failed to add product to cart. Please try again later.",
      error: errorMessage,
    };
  }
}
