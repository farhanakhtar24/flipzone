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
import { z } from "zod";

/**
 * Cart → wishlist. Removes the cart row (full quantity — "save for later"
 * means "not buying this right now") and upserts the product into the
 * wishlist. The (wishlistId, productId) unique index makes the upsert
 * race-safe.
 */
export const saveForLater = async (values: {
  cartItemId: string;
}): Promise<ApiResponse<null>> => {
  const session = await requireUser();
  if (!session) return unauthorizedResponse();

  const userId = session.user.id;

  const parsed = z.object({ cartItemId: z.string().min(1) }).safeParse(values);
  if (!parsed.success) {
    return { statusCode: 400, success: false, message: "Invalid cart data." };
  }
  const { cartItemId } = parsed.data;

  try {
    const result = await db.$transaction(async (prisma) => {
      const cartItem = await prisma.cartItem.findUnique({
        where: { id: cartItemId },
        include: { cart: { select: { userId: true, id: true } } },
      });

      if (!cartItem || cartItem.cart.userId !== userId) {
        return {
          statusCode: 404,
          success: false,
          message: "Cart item not found.",
        };
      }

      const wishlist = await prisma.wishlist.upsert({
        where: { userId },
        create: { userId },
        update: {},
      });
      await prisma.wishlistItem.upsert({
        where: {
          wishlistId_productId: {
            wishlistId: wishlist.id,
            productId: cartItem.productId,
          },
        },
        create: { wishlistId: wishlist.id, productId: cartItem.productId },
        update: {},
      });

      await prisma.cartItem.delete({ where: { id: cartItemId } });
      const remaining = await prisma.cartItem.count({
        where: { cartId: cartItem.cart.id },
      });
      if (remaining === 0) {
        await prisma.cart.delete({ where: { id: cartItem.cart.id } });
      }

      return null;
    });

    if (result) return result;

    revalidatePath("/", "layout");
    return {
      statusCode: 200,
      success: true,
      message: "Moved to wishlist.",
    };
  } catch (error) {
    console.error("Error saving cart item for later:", error);
    return serverErrorResponse("Failed to move item. Please try again later.");
  }
};

/**
 * Wishlist → cart. Adds the product to the cart (incrementing if already
 * present, stock-checked) and removes it from the wishlist.
 */
export const moveToCart = async (values: {
  productId: string;
}): Promise<ApiResponse<null>> => {
  const session = await requireUser();
  if (!session) return unauthorizedResponse();

  const userId = session.user.id;

  const parsed = z.object({ productId: z.string().min(1) }).safeParse(values);
  if (!parsed.success) {
    return { statusCode: 400, success: false, message: "Invalid product." };
  }
  const { productId } = parsed.data;

  try {
    const result = await db.$transaction(async (prisma) => {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { stock: true },
      });
      if (!product || product.stock < 1) {
        return {
          statusCode: 400,
          success: false,
          message: "This product is out of stock.",
        };
      }

      const cart = await prisma.cart.upsert({
        where: { userId },
        create: { userId },
        update: {},
      });

      const existing = await prisma.cartItem.findFirst({
        where: { cartId: cart.id, productId },
      });

      if (existing) {
        if (existing.quantity + 1 > product.stock) {
          return {
            statusCode: 400,
            success: false,
            message: `Only ${product.stock} items left in stock.`,
          };
        }
        await prisma.cartItem.update({
          where: { id: existing.id },
          data: { quantity: existing.quantity + 1 },
        });
      } else {
        await prisma.cartItem.create({
          data: { cartId: cart.id, productId, quantity: 1 },
        });
      }

      const wishlist = await prisma.wishlist.findUnique({
        where: { userId },
        select: { id: true },
      });
      if (wishlist) {
        await prisma.wishlistItem.deleteMany({
          where: { wishlistId: wishlist.id, productId },
        });
        const remaining = await prisma.wishlistItem.count({
          where: { wishlistId: wishlist.id },
        });
        if (remaining === 0) {
          await prisma.wishlist.delete({ where: { id: wishlist.id } });
        }
      }

      return null;
    });

    if (result) return result;

    revalidatePath("/", "layout");
    return {
      statusCode: 200,
      success: true,
      message: "Moved to cart.",
    };
  } catch (error) {
    console.error("Error moving wishlist item to cart:", error);
    return serverErrorResponse("Failed to move item. Please try again later.");
  }
};

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

export const updateCartItemQuantity = async (values: {  cartItemId: string;
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
