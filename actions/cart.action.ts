"use server";
import { db } from "@/db";
import { ApiResponse, IcartSummary } from "@/interfaces/actionInterface";
import {
  requireUser,
  serverErrorResponse,
  unauthorizedResponse,
} from "@/lib/auth-guard";
import { UpdateCartItemQuantitySchema } from "@/schemas/cart";
import { revalidatePath } from "next/cache";

export const getUserCart = async (): Promise<ApiResponse<IcartSummary>> => {
  const session = await requireUser();
  if (!session) return unauthorizedResponse();

  const userId = session.user.id;

  try {
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
        message: "Cart not found.",
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
    return serverErrorResponse(
      "Failed to fetch the cart. Please try again later.",
    );
  }
};

export const updateCartItemQuantity = async (values: {
  cartItemId: string;
  quantityChange: number;
}): Promise<ApiResponse<null>> => {
  const session = await requireUser();
  if (!session) return unauthorizedResponse();

  const userId = session.user.id;

  const validatedFields = UpdateCartItemQuantitySchema.safeParse(values);
  if (!validatedFields.success) {
    return {
      statusCode: 400,
      success: false,
      message: "Invalid cart data.",
    };
  }

  const { cartItemId, quantityChange } = validatedFields.data;

  try {
    const result = await db.$transaction(async (prisma) => {
      const cartItem = await prisma.cartItem.findUnique({
        where: {
          id: cartItemId,
        },
        include: {
          product: true,
          cart: {
            select: { userId: true },
          },
        },
      });

      // Ownership check: only operate on cart items that belong to the user
      if (!cartItem || cartItem.cart.userId !== userId) {
        return {
          statusCode: 404,
          success: false,
          message: "Cart item not found.",
        };
      }

      const newQuantity = cartItem.quantity + quantityChange;

      if (newQuantity <= 0) {
        await prisma.cartItem.delete({
          where: {
            id: cartItemId,
          },
        });

        const remainingItems = await prisma.cartItem.findMany({
          where: {
            cartId: cartItem.cartId,
          },
        });

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

      if (newQuantity > cartItem.product.stock) {
        return {
          statusCode: 400,
          success: false,
          message: `Only ${cartItem.product.stock} items left in stock.`,
        };
      }

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

    revalidatePath("/", "layout");

    return result;
  } catch (error) {
    console.error("Error updating cart item quantity:", error);
    return serverErrorResponse(
      "Failed to update cart item quantity. Please try again later.",
    );
  }
};

export const placeOrderFromCart = async (): Promise<ApiResponse<null>> => {
  const session = await requireUser();
  if (!session) return unauthorizedResponse();

  const userId = session.user.id;

  try {
    const result = await db.$transaction(async (prisma) => {
      const cart = await prisma.cart.findUnique({
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

      if (!cart || cart.items.length === 0) {
        return {
          statusCode: 404,
          success: false,
          message: "Cart is empty or not found.",
        };
      }

      for (const item of cart.items) {
        if (item.quantity > item.product.stock) {
          return {
            statusCode: 400,
            success: false,
            message: `Insufficient stock for ${item.product.title}. Only ${item.product.stock} left.`,
          };
        }
      }

      await prisma.order.create({
        data: {
          userId,
          total: cart.items.reduce(
            (total, item) => total + item.product.price * item.quantity,
            0,
          ),
          status: "PLACED",
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

      for (const item of cart.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      await prisma.cartItem.deleteMany({
        where: {
          cartId: cart.id,
        },
      });

      await prisma.cart.delete({
        where: {
          id: cart.id,
        },
      });

      return {
        statusCode: 200,
        success: true,
        message: "Order placed successfully, and cart cleared.",
      };
    });

    revalidatePath("/", "layout");

    return result;
  } catch (error) {
    console.error("Error placing order:", error);
    return serverErrorResponse(
      "Failed to place order. Please try again later.",
    );
  }
};
