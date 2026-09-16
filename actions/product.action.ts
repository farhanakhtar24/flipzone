"use server";
import { db } from "@/db";
import {
  ApiResponse,
  IproductWithCartStatus,
} from "@/interfaces/actionInterface";
import { requireUser, unauthorizedResponse } from "@/lib/auth-guard";
import { serverErrorResponse } from "@/lib/auth-guard";
import { AddToCartSchema } from "@/schemas/cart";
import { Prisma, Product } from "@prisma/client";
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
    page?: number;
    pageSize?: number;
  },
): Promise<ApiResponse<Product[]> & { totalCount?: number }> => {
  const session = await requireUser();
  if (!session) return unauthorizedResponse();

  const userId = session.user.id;

  try {
    // Parse comma-separated multi-select values
    const brands = filters?.brand?.split(",").filter(Boolean);
    const categories = filters?.category?.split(",").filter(Boolean);

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
      ...(brands?.length && {
        brand: { in: brands },
      }),
      ...(categories?.length && {
        categories: {
          some: {
            category: {
              name: { in: categories },
            },
          },
        },
      }),
      ...(filters?.inStock === "true" && {
        stock: { gte: 1 },
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

    // Pagination — page is 1-based; when absent, return everything (home rails).
    const page =
      filters?.page && Number.isFinite(filters.page) && filters.page > 0
        ? Math.floor(filters.page)
        : undefined;
    const pageSize =
      filters?.pageSize && Number.isFinite(filters.pageSize) && filters.pageSize > 0
        ? Math.min(Math.floor(filters.pageSize), 48)
        : 24;

    const [products, totalCount] = await Promise.all([
      db.product.findMany({
        where,
        orderBy,
        ...(page && { skip: (page - 1) * pageSize, take: pageSize }),
      }),
      db.product.count({ where }),
    ]);

    return {
      statusCode: 200,
      success: true,
      message: "Products fetched successfully.",
      data: products,
      totalCount,
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    return serverErrorResponse("Failed to fetch products. Please try again later.");
  }
};

/** Fetch several products by id (e.g. recently-viewed list), keeping input order. */
export const getProductsByIds = async (
  ids: string[],
): Promise<ApiResponse<Product[]>> => {
  const session = await requireUser();
  if (!session) return unauthorizedResponse();

  try {
    const products = await db.product.findMany({
      where: { id: { in: ids } },
    });

    const byId = new Map(products.map((p) => [p.id, p]));
    const ordered = ids
      .map((id) => byId.get(id))
      .filter(Boolean) as (typeof products)[number][];

    return {
      statusCode: 200,
      success: true,
      message: "Products fetched successfully.",
      data: ordered,
    };
  } catch (error) {
    console.error("Error fetching products by ids:", error);
    return serverErrorResponse("Failed to fetch products. Please try again later.");
  }
};

/**
 * Similar products for a PDP "Related" rail: same leaf category first, then
 * same top-level group, scored by brand/price proximity in the caller.
 */
export const getRelatedProducts = async (
  productId: string,
  limit = 8,
): Promise<ApiResponse<Product[]>> => {
  const session = await requireUser();
  if (!session) return unauthorizedResponse();

  try {
    const product = await db.product.findUnique({
      where: { id: productId },
      include: { categories: { include: { category: true } } },
    });
    if (!product) {
      return {
        statusCode: 404,
        success: false,
        message: "Product not found.",
      };
    }

    const leafSlugs = product.categories.map((pc) => pc.category.name);

    const candidates = await db.product.findMany({
      where: {
        id: { not: productId },
        ...(leafSlugs.length
          ? {
              categories: {
                some: { category: { name: { in: leafSlugs } } },
              },
            }
          : {}),
      },
      orderBy: { rating: "desc" },
      take: limit * 3,
      include: {
        categories: { include: { category: true } },
      },
    });

    const scored = candidates
      .map(({ categories, ...p }) => {
        const sharedLeaves = categories.filter((pc) =>
          leafSlugs.includes(pc.category.name),
        ).length;
        const brandBoost = p.brand && p.brand === product.brand ? 2 : 0;
        const priceBoost =
          product.price > 0 &&
          Math.abs(p.price - product.price) <= product.price * 0.3
            ? 1
            : 0;
        return {
          ...p,
          score: sharedLeaves * 3 + brandBoost + priceBoost + (p.rating ?? 0) / 10,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ score, ...p }) => p);

    return {
      statusCode: 200,
      success: true,
      message: "Related products fetched successfully.",
      data: scored,
    };
  } catch (error) {
    console.error("Error fetching related products:", error);
    return serverErrorResponse("Failed to fetch related products.");
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

export interface HomeRails {
  deals: Product[];
  bestsellers: Product[];
  newArrivals: Product[];
  recommended: Product[];
}

/**
 * The four product rails the marketplace home page renders. "recommended" is
 * personalized from the user's own categories (wishlist/orders) when signed in
 * behavior is available, falling back to bestsellers.
 */
export const getHomeRails = async (
  recentIds: string[] = [],
): Promise<ApiResponse<HomeRails>> => {
  const session = await requireUser();
  if (!session) return unauthorizedResponse();

  const userId = session.user.id;

  try {
    const [deals, bestsellers, newArrivals, favorites] = await Promise.all([
      db.product.findMany({
        where: { discountPercentage: { gte: 25 }, stock: { gte: 1 } },
        orderBy: { discountPercentage: "desc" },
        take: 10,
      }),
      db.product.findMany({
        where: { stock: { gte: 1 } },
        orderBy: [{ rating: "desc" }],
        take: 10,
      }),
      db.product.findMany({
        where: { stock: { gte: 1 } },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      // Categories the user engaged with. Two flat queries instead of a single
      // relation-OR: over MongoDB, `product: { orderItems: { some... } } OR
      // { wishlistItems: { some... } }` emits a $size aggregation that errors
      // (code 17124) whenever the user has a null relation array on one side.
      recentIds.length
        ? db.productCategory.findMany({
            where: { productId: { in: recentIds } },
            select: { categoryId: true },
          })
        : (async () => {
            const [ordered, wishlisted] = await Promise.all([
              db.order.findMany({
                where: { userId },
                select: { items: { select: { productId: true } } },
              }),
              db.wishlistItem.findMany({
                where: { wishlist: { userId } },
                select: { productId: true },
              }),
            ]);
            const productIds = [
              ...ordered.flatMap((o) => o.items.map((i) => i.productId)),
              ...wishlisted.map((w) => w.productId),
            ];
            if (!productIds.length) return [] as { categoryId: string }[];
            return db.productCategory.findMany({
              where: { productId: { in: productIds } },
              select: { categoryId: true },
            });
          })(),
    ]);

    let recommended: Product[] = [];
    const favoriteCategoryIds = favorites.map((f) => f.categoryId);
    if (favoriteCategoryIds.length > 0) {
      recommended = await db.product.findMany({
        where: {
          stock: { gte: 1 },
          id: { notIn: recentIds },
          categories: { some: { categoryId: { in: favoriteCategoryIds } } },
        },
        orderBy: { rating: "desc" },
        take: 10,
      });
    }
    if (recommended.length === 0) {
      recommended = bestsellers;
    }

    return {
      statusCode: 200,
      success: true,
      message: "Home rails fetched successfully.",
      data: {
        deals,
        bestsellers,
        newArrivals,
        recommended,
      },
    };
  } catch (error) {
    console.error("Error fetching home rails:", error);
    return serverErrorResponse("Failed to fetch products for the home page.");
  }
};
