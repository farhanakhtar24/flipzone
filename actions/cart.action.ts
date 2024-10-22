"use server";
import { db } from "@/db";
import { ApiResponse, IcartSummary } from "@/interfaces/actionInterface";
import { revalidatePath } from "next/cache";

export const getUserCart = async (
  userId: string,
): Promise<ApiResponse<IcartSummary>> => {
  try {
    // Fetch the user's cart from the database, including items and their associated products
    const cart = await db.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart) {
      return {
        statusCode: 404,
        success: false,
        message: "Cart not found for the given user.",
      };
    }

    // Calculate the total maximum retail price, discount, and final price
    let totalMRP = 0;
    let totalDiscount = 0;
    let finalPrice = 0;
    let totalQuantity = 0;

    cart.items.forEach((item) => {
      const productPrice = item.product.price;
      const discountPercentage = item.product.discountPercentage || 0;
      const quantity = item.quantity;

      const itemMRP = productPrice / (1 - discountPercentage / 100);
      const itemDiscount = itemMRP - productPrice;
      const itemFinalPrice = productPrice * quantity;

      totalMRP += itemMRP * quantity;
      totalDiscount += itemDiscount * quantity;
      finalPrice += itemFinalPrice;
      totalQuantity += quantity;
    });

    // Create a summary object to return in the response
    const cartSummary: IcartSummary = {
      cart,
      totalMRP,
      totalDiscount,
      finalPrice,
      totalQuantity,
    };

    return {
      statusCode: 200,
      success: true,
      message: "Cart fetched successfully.",
      data: cartSummary,
    };
  } catch (error) {
    console.error("Error fetching cart:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return {
      statusCode: 500,
      success: false,
      message: "Failed to fetch the cart. Please try again later.",
      error: errorMessage,
    };
  }
};
export const updateCartItemQuantity = async (
  cartItemId: string,
  quantityChange: number, // Positive or negative value indicating increment or decrement
): Promise<ApiResponse<null>> => {
  try {
    // Start a transaction
    const result = await db.$transaction(async (prisma) => {
      // Find the cart item first
      const cartItem = await prisma.cartItem.findUnique({
        where: {
          id: cartItemId,
        },
      });

      // If the cart item is not found, return a 404 response
      if (!cartItem) {
        return {
          statusCode: 404,
          success: false,
          message: "Cart item not found.",
        };
      }

      // Calculate the new quantity based on the change
      const newQuantity = cartItem.quantity + quantityChange;

      // If the new quantity is less than or equal to 0, delete the cart item
      if (newQuantity <= 0) {
        await prisma.cartItem.delete({
          where: {
            id: cartItemId,
          },
        });

        // Check if there are any remaining items in the cart
        const remainingItems = await prisma.cartItem.findMany({
          where: {
            cartId: cartItem.cartId,
          },
        });

        // If no items remain in the cart, delete the cart itself
        if (remainingItems.length === 0) {
          await prisma.cart.delete({
            where: {
              id: cartItem.cartId,
            },
          });

          return {
            statusCode: 200,
            success: true,
            message: "Cart and cart item deleted as no items are left.",
          };
        }

        return {
          statusCode: 200,
          success: true,
          message: "Cart item removed from cart.",
        };
      } else {
        // Otherwise, update the cart item with the new quantity
        await prisma.cartItem.update({
          where: {
            id: cartItemId,
          },
          data: {
            quantity: newQuantity,
          },
        });

        return {
          statusCode: 200,
          success: true,
          message: `Cart item quantity ${
            quantityChange > 0 ? "increased" : "decreased"
          } successfully.`,
        };
      }
    });

    // Optionally, trigger any revalidation if necessary
    revalidatePath("/", "layout");

    // Return the result of the transaction (success)
    return result;
  } catch (error) {
    console.error("Error updating cart item quantity:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return {
      statusCode: 500,
      success: false,
      message: "Failed to update cart item quantity. Please try again later.",
      error: errorMessage,
    };
  }
};
