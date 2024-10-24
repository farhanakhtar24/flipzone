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
    // Fetch products with cart item and wishlist item info for checking user status
    const products = await db.product.findMany({
      include: {
        cartItems: {
          where: {
            cart: {
              userId,
            },
          },
          select: {
            id: true, // Only fetch necessary fields to check if the product is in the cart
          },
        },
        wishlistItems: {
          where: {
            wishlist: {
              userId,
            },
          },
          select: {
            id: true, // Only fetch necessary fields to check if the product is in the wishlist
          },
        },
      },
    });

    // Map the products to include the isInCart and isWishlisted status
    const productsWithCartStatus = products.map(
      ({ cartItems, wishlistItems, ...product }) => ({
        ...product,
        isInCart: cartItems.length > 0, // Check if the product is in the user's cart
        isWishlisted: wishlistItems.length > 0, // Check if the product is in the user's wishlist
      }),
    );

    return {
      statusCode: 200,
      success: true,
      message: "Products fetched successfully.",
      data: productsWithCartStatus,
    };
  } catch (error) {
    console.error(
      "Error fetching products with cart and wishlist status:",
      error,
    );
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
        wishlistItems: {
          where: {
            wishlist: {
              userId,
            },
          },
        },
        comparisonItems: {
          where: {
            comparison: {
              userId,
            },
          },
        },
        orderItems: {
          where: {
            order: {
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

    // Determine if the product is in the user's cart, wishlist, and comparison list
    const isInCart = product.cartItems.length > 0;
    const isWishlisted = product.wishlistItems.length > 0;
    const isCompared = product.comparisonItems.length > 0;
    const isOrdered = product.orderItems.length > 0;

    // Create a new product object that includes isInCart, isWishlisted, and isCompared
    const productWithCartStatus = {
      ...product,
      isInCart,
      isWishlisted,
      isCompared,
      isOrdered,
    };

    // Return the product with the isInCart, isWishlisted, and isCompared properties included
    return {
      statusCode: 200,
      success: true,
      message: "Product fetched successfully.",
      data: productWithCartStatus,
    };
  } catch (error) {
    console.error("Error fetching product:", error);
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
