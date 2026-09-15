"use server";

import { db } from "@/db";
import { ApiResponse, IOrderSummary } from "@/interfaces/actionInterface";
import {
  requireUser,
  serverErrorResponse,
  unauthorizedResponse,
} from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";

const CANCELLABLE_STATUSES = ["PENDING", "PAID", "PLACED"] as const;

export const cancelOrder = async (
  orderId: string,
): Promise<ApiResponse<null>> => {
  const session = await requireUser();
  if (!session) return unauthorizedResponse();

  if (!orderId || typeof orderId !== "string") {
    return { statusCode: 400, success: false, message: "Invalid order." };
  }

  try {
    const order = await db.order.findFirst({
      where: { id: orderId, userId: session.user.id },
      include: { items: true },
    });

    if (!order) {
      return { statusCode: 404, success: false, message: "Order not found." };
    }

    if (
      !CANCELLABLE_STATUSES.includes(
        order.status as (typeof CANCELLABLE_STATUSES)[number],
      )
    ) {
      return {
        statusCode: 400,
        success: false,
        message: `Orders with status ${order.status} cannot be cancelled.`,
      };
    }

    await db.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: { status: "CANCELLED" },
      });

      // Restore stock only if payment had been captured (stock was
      // decremented by the webhook for PAID orders, and inline for PLACED).
      if (order.status !== "PENDING") {
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }
    });

    revalidatePath("/", "layout");
    return {
      statusCode: 200,
      success: true,
      message: "Order cancelled successfully.",
    };
  } catch (error) {
    console.error("Error cancelling order:", error);
    return serverErrorResponse("Failed to cancel the order.");
  }
};

export const getUserOrders = async (): Promise<
  ApiResponse<IOrderSummary[]>
> => {
  const session = await requireUser();
  if (!session) return unauthorizedResponse();

  const userId = session.user.id;

  try {
    const orders = await db.order.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!orders || orders.length === 0) {
      return {
        statusCode: 404,
        success: false,
        message: "No orders found.",
      };
    }

    const orderSummaries: IOrderSummary[] = orders.map((order) => ({
      orderId: order.id,
      status: order.status,
      total: order.total,
      placedAt: order.createdAt,
      items: order.items,
    }));

    return {
      statusCode: 200,
      success: true,
      message: "Orders fetched successfully.",
      data: orderSummaries,
    };
  } catch (error) {
    console.error("Error fetching orders:", error);
    return serverErrorResponse(
      "Failed to fetch orders. Please try again later.",
    );
  }
};

export const getOrderById = async (
  orderId: string,
): Promise<ApiResponse<IOrderSummary>> => {
  const session = await requireUser();
  if (!session) return unauthorizedResponse();

  try {
    // Scope the lookup to the requesting user's orders only
    const order = await db.order.findFirst({
      where: {
        id: orderId,
        userId: session.user.id,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return {
        statusCode: 404,
        success: false,
        message: "Order not found.",
      };
    }

    const orderSummary: IOrderSummary = {
      orderId: order.id,
      status: order.status,
      total: order.total,
      placedAt: order.createdAt,
      items: order.items,
    };

    return {
      statusCode: 200,
      success: true,
      message: "Order fetched successfully.",
      data: orderSummary,
    };
  } catch (error) {
    console.error("Error fetching order:", error);
    return serverErrorResponse(
      "Failed to fetch the order. Please try again later.",
    );
  }
};
