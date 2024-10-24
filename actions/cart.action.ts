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
      // Find the cart item and product stock
      const cartItem = await prisma.cartItem.findUnique({
        where: {
          id: cartItemId,
        },
        include: {
          product: true, // Include the related product to check its stock
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
      }

      // Check if the new quantity exceeds available stock
      if (newQuantity > cartItem.product.stock) {
        return {
          statusCode: 400,
          success: false,
          message: `Only ${cartItem.product.stock} items left in stock.`,
        };
      }

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

export const placeOrderFromCart = async (
  cartId: string,
): Promise<ApiResponse<null>> => {
  try {
    // Start a transaction
    const result = await db.$transaction(async (prisma) => {
      // Find the user's cart with its items
      const cart = await prisma.cart.findUnique({
        where: {
          id: cartId,
        },
        include: {
          items: {
            include: {
              product: true, // Include product details to adjust stock
            },
          },
        },
      });

      // If the cart is not found or empty, return a 404 response
      if (!cart || cart.items.length === 0) {
        return {
          statusCode: 404,
          success: false,
          message: "Cart is empty or not found.",
        };
      }

      // Validate stock for each item before placing the order
      for (const item of cart.items) {
        if (item.quantity > item.product.stock) {
          return {
            statusCode: 400,
            success: false,
            message: `Insufficient stock for ${item.product.title}. Only ${item.product.stock} left.`,
          };
        }
      }

      // Create an order object with ordered items from the cart
      await prisma.order.create({
        data: {
          userId: cart.userId,
          total: cart.items.reduce(
            (total, item) => total + item.product.price * item.quantity,
            0,
          ), // Calculate total price
          status: "PLACED", // Initial order status
          items: {
            create: cart.items.map((cartItem) => ({
              quantity: cartItem.quantity,
              product: {
                connect: {
                  id: cartItem.productId,
                },
              },
            })),
          },
        },
      });

      // After the order is created, update the product stock
      for (const item of cart.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity, // Reduce stock by the ordered quantity
            },
          },
        });
      }

      // Delete the cart and its items after the order is placed
      await prisma.cartItem.deleteMany({
        where: {
          cartId: cartId,
        },
      });

      await prisma.cart.delete({
        where: {
          id: cartId,
        },
      });

      return {
        statusCode: 200,
        success: true,
        message: "Order placed successfully, and cart cleared.",
      };
    });

    // Optionally, trigger any revalidation if necessary
    revalidatePath("/", "layout");

    return result;
  } catch (error) {
    console.error("Error placing order:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return {
      statusCode: 500,
      success: false,
      message: "Failed to place order. Please try again later.",
      error: errorMessage,
    };
  }
};
