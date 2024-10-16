"use server";
import { db } from "@/db";
import {
  ApiResponse,
  IproductWithCartStatus,
} from "@/interfaces/actionInterface";
import { revalidatePath } from "next/cache";

export const getAllProducts = async (
  userId: string,
): Promise<ApiResponse<IproductWithCartStatus[]>> => {
  try {
    // Fetch products with cart item info only for checking user cart status
    const products = await db.product.findMany({
      include: {
        cartItems: {
          where: {
            cart: {
              userId,
            },
          },
          select: {
            id: true, // Only fetch necessary fields for checking if the product is in the cart
          },
        },
      },
    });

    // Remove the cartItems property and only keep the isInCart status for each product
    const productsWithCartStatus = products.map(
      ({ cartItems, ...product }) => ({
        ...product,
        isInCart: cartItems.length > 0, // Check if there are any cart items for the user
      }),
    );

    return {
      statusCode: 200,
      success: true,
      message: "Products fetched successfully.",
      data: productsWithCartStatus,
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
}: {
  userId: string;
  productId: string;
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
                quantity: 1,
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
              quantity: existingCartItem.quantity + 1,
            },
          });
        } else {
          // If the product is not in the cart, create a new cart item
          await prisma.cartItem.create({
            data: {
              cartId: cart.id,
              productId,
              quantity: 1,
            },
          });
        }
      }
    });

    revalidatePath("/", "layout");
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

export const getProductById = async (
  productId: string,
  userId: string,
): Promise<ApiResponse<IproductWithCartStatus>> => {
  try {
    // Fetch the product details
    const product = await db.product.findUnique({
      where: {
        id: productId,
      },
      include: {
        cartItems: {
          where: {
            cart: {
              userId,
            },
          },
        },
        reviews: true,
      },
    });

    // If product doesn't exist, return a not found response
    if (!product) {
      return {
        statusCode: 404,
        success: false,
        message: "Product not found.",
      };
    }

    // Determine if the product is in the user's cart
    const isInCart = product.cartItems.length > 0;

    // Create a new product object that includes isInCart without altering original product
    const productWithCartStatus = {
      ...product,
      isInCart,
    };

    // Return the product with the isInCart property included
    return {
      statusCode: 200,
      success: true,
      message: "Product fetched successfully.",
      data: productWithCartStatus,
    };
  } catch (error) {
    console.error(error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return {
      statusCode: 500,
      success: false,
      message: "Failed to fetch product. Please try again later.",
      error: errorMessage,
    };
  }
};
