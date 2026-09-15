"use server";

import { db } from "@/db";
import { ApiResponse } from "@/interfaces/actionInterface";
import {
  forbiddenResponse,
  requireAdmin,
  serverErrorResponse,
} from "@/lib/auth-guard";
import { OrderStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export type AdminStats = {
  totalRevenue: number;
  orderCount: number;
  userCount: number;
  productCount: number;
  ordersByStatus: { status: OrderStatus; count: number }[];
  lowStock: { id: string; title: string; stock: number }[];
  recentOrders: {
    id: string;
    total: number;
    status: OrderStatus;
    createdAt: Date;
    userEmail?: string | null;
  }[];
};

export const getAdminStats = async (): Promise<ApiResponse<AdminStats>> => {
  const session = await requireAdmin();
  if (!session) return forbiddenResponse();

  try {
    const [orders, orderCount, userCount, productCount, lowStock] =
      await Promise.all([
        db.order.findMany({
          where: { status: { in: ["PAID", "SHIPPED", "DELIVERED"] } },
          select: { total: true },
        }),
        db.order.count(),
        db.user.count(),
        db.product.count(),
        db.product.findMany({
          where: { stock: { lt: 10 } },
          select: { id: true, title: true, stock: true },
          orderBy: { stock: "asc" },
          take: 10,
        }),
      ]);

    const [pending, placed, paid, shipped, delivered, cancelled] =
      await Promise.all(
        (
          [
            "PENDING",
            "PLACED",
            "PAID",
            "SHIPPED",
            "DELIVERED",
            "CANCELLED",
          ] as OrderStatus[]
        ).map((status) => db.order.count({ where: { status } })),
      );

    const recentOrders = await db.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { user: { select: { email: true } } },
    });

    return {
      statusCode: 200,
      success: true,
      message: "Stats fetched.",
      data: {
        totalRevenue: orders.reduce((sum, o) => sum + o.total, 0),
        orderCount,
        userCount,
        productCount,
        ordersByStatus: [
          { status: "PENDING", count: pending },
          { status: "PLACED", count: placed },
          { status: "PAID", count: paid },
          { status: "SHIPPED", count: shipped },
          { status: "DELIVERED", count: delivered },
          { status: "CANCELLED", count: cancelled },
        ],
        lowStock,
        recentOrders: recentOrders.map((o) => ({
          id: o.id,
          total: o.total,
          status: o.status,
          createdAt: o.createdAt,
          userEmail: o.user.email,
        })),
      },
    };
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return serverErrorResponse("Failed to load dashboard.");
  }
};

export const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus,
): Promise<ApiResponse<null>> => {
  const session = await requireAdmin();
  if (!session) return forbiddenResponse();

  if (!Object.values(OrderStatus).includes(status)) {
    return { statusCode: 400, success: false, message: "Invalid status." };
  }

  try {
    await db.order.update({ where: { id: orderId }, data: { status } });
    revalidatePath("/", "layout");
    return { statusCode: 200, success: true, message: `Order → ${status}.` };
  } catch (error) {
    console.error("Error updating order status:", error);
    return serverErrorResponse("Failed to update order.");
  }
};

export const updateProductStock = async (
  productId: string,
  stock: number,
): Promise<ApiResponse<null>> => {
  const session = await requireAdmin();
  if (!session) return forbiddenResponse();

  if (typeof stock !== "number" || !Number.isInteger(stock) || stock < 0) {
    return { statusCode: 400, success: false, message: "Invalid stock." };
  }

  try {
    await db.product.update({ where: { id: productId }, data: { stock } });
    revalidatePath("/", "layout");
    return { statusCode: 200, success: true, message: "Stock updated." };
  } catch (error) {
    console.error("Error updating stock:", error);
    return serverErrorResponse("Failed to update stock.");
  }
};
