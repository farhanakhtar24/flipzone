"use server";
import { db } from "@/db";
import {
  ApiResponse,
  IproductWithCartStatus,
} from "@/interfaces/actionInterface";
import { requireUser, unauthorizedResponse } from "@/lib/auth-guard";
import { serverErrorResponse } from "@/lib/auth-guard";
import { AddToCartSchema } from "@/schemas/cart";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

// Sort fields that are safe to expose to the client
const SORTABLE_FIELDS: Record<string, keyof Prisma.ProductOrderByWithRelationInput> = {
  price: "price",
  rating: "rating",
  title: "title",
  createdAt: "createdAt",
  discountPercentage: "discountPercentage",
};

export const getAllProducts = async (
  filters?: {
    search?: string;
    priceRange?: [number, number];
    rating?: number;
    discountPercentage?: number;
    brand?: string;
    category?: string;
    sortBy?: string;
    inStock?: string;
  },
): Promise<ApiResponse<IproductWithCartStatus[]>> => {
  const session = await requireUser();
  if (!session) return unauthorizedResponse();

  const userId = session.user.id;

  try {
    // Build the where clause based on filters
    const where: Prisma.ProductWhereInput = {
      ...(filters?.search && {
        OR: [
          { title: { contains: filters.search, mode: "insensitive" } },
          { description: { contains: filters.search, mode: "insensitive" } },
        ],
      }),
      ...(filters?.priceRange && {
        price: {
          gte: filters.priceRange[0],
          lte: filters.priceRange[1],
        },
      }),
      ...(filters?.rating && {
        rating: { gte: filters.rating },
      }),
      ...(filters?.discountPercentage && {
        discountPercentage: { gte: filters.discountPercentage },
      }),
      ...(filters?.brand && {
        brand: { equals: filters.brand },
      }),
      ...(filters?.category && {
        categories: {
          some: {
            category: {
              name: { equals: filters.category },
            },
          },
        },
      }),
      ...(filters?.inStock && {
        stock: { gte: filters.inStock === "true" ? 1 : 0 },
      }),
    };

    // Allowlist-based sorting to prevent arbitrary field injection
    const [rawField, rawDirection] = (filters?.sortBy?.split(":") || [
      "rating",
      "desc",
    ]) as [string, "asc" | "desc"];

    const sortField = SORTABLE_FIELDS[rawField] ?? "rating";
    const sortDirection = rawDirection === "asc" ? "asc" : "desc";

    const orderBy = {
      [sortField]: sortDirection,
    };

    // Fetch products with cart/wishlist info for checking user status
    const products = await db.product.findMany({
      where,
      orderBy,
      include: {
        cartItems: {
          where: {
            cart: {
              userId,
            },
          },
          select: {
            id: true,
          },
        },
        wishlistItems: {
          where: {
            wishlist: {
              userId,
            },
          },
          select: {
            id: true,
          },
        },
      },
    });

    const productsWithCartStatus = products.map(
      ({ cartItems, wishlistItems, ...product }) => ({
        ...product,
        isInCart: cartItems.length > 0,
        isWishlisted: wishlistItems.length > 0,
      }),
    );

    return {
      statusCode: 200,
      success: true,
      message: "Products fetched successfully.",
      data: productsWithCartStatus,
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    return serverErrorResponse("Failed to fetch products. Please try again later.");
  }
};

export async function addToCart(values: {
  productId: string;
}): Promise<ApiResponse<null>> {
  const session = await requireUser();
  if (!session) return unauthorizedResponse();

  const userId = session.user.id;

  const validatedFields = AddToCartSchema.safeParse(values);
  if (!validatedFields.success) {
    return {
      statusCode: 400,
      success: false,
      message: "Invalid product data.",
    };
  }

  const { productId } = validatedFields.data;

  try {
    const result = await db.$transaction(async (prisma) => {
      // Verify the product exists and is in stock before touching the cart
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { id: true, stock: true },
      });

      if (!product) {
        return {
          statusCode: 404,
          success: false,
          message: "Product not found.",
        };
      }

      let cart = await prisma.cart.findUnique({
        where: { userId },
      });

      if (!cart) {
        if (product.stock < 1) {
          return {
            statusCode: 400,
            success: false,
            message: "This product is out of stock.",
          };
        }

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
        const existingCartItem = await prisma.cartItem.findFirst({
          where: {
            cartId: cart.id,
            productId,
          },
        });

        if (existingCartItem) {
          if (existingCartItem.quantity + 1 > product.stock) {
            return {
              statusCode: 400,
              success: false,
              message: `Only ${product.stock} items left in stock.`,
            };
          }

          await prisma.cartItem.update({
            where: {
              id: existingCartItem.id,
            },
            data: {
              quantity: existingCartItem.quantity + 1,
            },
          });
        } else {
          if (product.stock < 1) {
            return {
              statusCode: 400,
              success: false,
              message: "This product is out of stock.",
            };
          }

          await prisma.cartItem.create({
            data: {
              cartId: cart.id,
              productId,
              quantity: 1,
            },
          });
        }
      }

      return null;
    });

    if (result) return result;

    revalidatePath("/", "layout");
    return {
      statusCode: 200,
      success: true,
      message: "Product added to cart successfully.",
    };
  } catch (error) {
    console.error("Error adding product to cart:", error);
    return serverErrorResponse(
      "Failed to add product to cart. Please try again later.",
    );
  }
}

export const getProductById = async (
  productId: string,
): Promise<ApiResponse<IproductWithCartStatus>> => {
  const session = await requireUser();
  if (!session) return unauthorizedResponse();

  const userId = session.user.id;

  try {
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
          select: { id: true },
        },
        wishlistItems: {
          where: {
            wishlist: {
              userId,
            },
          },
          select: { id: true },
        },
        comparisonItems: {
          where: {
            comparison: {
              userId,
            },
          },
          select: { id: true },
        },
        orderItems: {
          where: {
            order: {
              userId,
            },
          },
          select: { id: true },
        },
        reviews: {
          orderBy: { date: "desc" },
        },
      },
    });

    if (!product) {
      return {
        statusCode: 404,
        success: false,
        message: "Product not found.",
      };
    }

    const { cartItems, wishlistItems, comparisonItems, orderItems, ...rest } =
      product;

    const productWithCartStatus = {
      ...rest,
      isInCart: cartItems.length > 0,
      isWishlisted: wishlistItems.length > 0,
      isCompared: comparisonItems.length > 0,
      isOrdered: orderItems.length > 0,
    };

    return {
      statusCode: 200,
      success: true,
      message: "Product fetched successfully.",
      data: productWithCartStatus,
    };
  } catch (error) {
    console.error("Error fetching product:", error);
    return serverErrorResponse(
      "Failed to fetch product. Please try again later.",
    );
  }
};
