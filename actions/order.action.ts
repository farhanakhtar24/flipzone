"use server";

import { db } from "@/db";
import { ApiResponse, IOrderSummary } from "@/interfaces/actionInterface";

export const getUserOrders = async (
  userId: string,
): Promise<ApiResponse<IOrderSummary[]>> => {
  try {
    // Fetch all orders for the user, ordered by ID
    const orders = await db.order.findMany({
      where: {
        userId,
      },
      orderBy: {
        id: "asc",
      }, // Change to "desc" for reverse order
      include: {
        items: {
          include: {
            product: true, // Include product details for each order item
          },
        },
      },
    });

    if (!orders || orders.length === 0) {
      return {
        statusCode: 404,
        success: false,
        message: "No orders found for the given user.",
      };
    }

    // Create a summary array of orders to return in the response
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
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return {
      statusCode: 500,
      success: false,
      message: "Failed to fetch orders. Please try again later.",
      error: errorMessage,
    };
  }
};

export const getOrderById = async (
  orderId: string,
): Promise<ApiResponse<IOrderSummary>> => {
  try {
    // Fetch the order by its ID
    const order = await db.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        items: {
          include: {
            product: true, // Include product details for each order item
          },
        },
      },
    });

    if (!order) {
      return {
        statusCode: 404,
        success: false,
        message: "Order not found for the given ID.",
      };
    }

    // Create an order summary to return in the response
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
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return {
      statusCode: 500,
      success: false,
      message: "Failed to fetch the order. Please try again later.",
      error: errorMessage,
    };
  }
};
