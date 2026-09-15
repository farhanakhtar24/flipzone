"use server";

import { db } from "@/db";
import { ApiResponse } from "@/interfaces/actionInterface";
import {
  requireUser,
  serverErrorResponse,
  unauthorizedResponse,
} from "@/lib/auth-guard";
import { getStripe, toStripeAmount } from "@/lib/stripe";
import { AddressIdSchema } from "@/schemas/address";

export type CheckoutResult = { checkoutUrl: string };

/**
 * Creates a PENDING order from the user's cart along with a Stripe
 * Checkout Session. Stock is decremented and the cart cleared only when
 * the Stripe webhook confirms payment (`checkout.session.completed`).
 */
export const createCheckoutSession = async (
  values: unknown,
): Promise<ApiResponse<CheckoutResult>> => {
  const session = await requireUser();
  if (!session) return unauthorizedResponse();

  const stripe = getStripe();
  if (!stripe) {
    return {
      statusCode: 503,
      success: false,
      message: "Payments are not configured. Please try again later.",
    };
  }

  const validated = AddressIdSchema.safeParse(values);
  if (!validated.success) {
    return { statusCode: 400, success: false, message: "Invalid address." };
  }

  const userId = session.user.id;

  try {
    const address = await db.address.findFirst({
      where: { id: validated.data.addressId, userId },
    });
    if (!address) {
      return {
        statusCode: 404,
        success: false,
        message: "Address not found. Add a delivery address first.",
      };
    }

    const cart = await db.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) {
      return {
        statusCode: 400,
        success: false,
        message: "Your cart is empty.",
      };
    }

    for (const item of cart.items) {
      if (item.quantity > item.product.stock) {
        return {
          statusCode: 400,
          success: false,
          message: `${item.product.title} has only ${item.product.stock} left in stock. Update your cart.`,
        };
      }
    }

    const total = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0,
    );

    // Snapshot the cart into a PENDING order. Stripe session id is filled in
    // right after session creation and ties the two together idempotently.
    const order = await db.order.create({
      data: {
        userId,
        total,
        status: "PENDING",
        shippingName: address.fullName,
        shippingLine1: address.line1,
        shippingLine2: address.line2,
        shippingCity: address.city,
        shippingState: address.state,
        shippingPostalCode: address.postalCode,
        shippingCountry: address.country,
        shippingPhone: address.phone,
        items: {
          create: cart.items.map((item) => ({
            quantity: item.quantity,
            unitPrice: item.product.price,
            title: item.product.title,
            thumbnail: item.product.thumbnail,
            product: { connect: { id: item.productId } },
          })),
        },
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: session.user.email ?? undefined,
      client_reference_id: order.id,
      metadata: { orderId: order.id, userId },
      payment_intent_data: { metadata: { orderId: order.id } },
      line_items: cart.items.map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency: "usd",
          unit_amount: toStripeAmount(item.product.price),
          product_data: {
            name: item.product.title,
            images: item.product.thumbnail ? [item.product.thumbnail] : [],
          },
        },
      })),
      success_url: `${appUrl}/checkout/success?orderId=${order.id}`,
      cancel_url: `${appUrl}/cart`,
      expires_at: Math.floor(Date.now() / 1000) + 60 * 30, // 30 min minimum
    });

    await db.order.update({
      where: { id: order.id },
      data: { stripeSessionId: checkoutSession.id },
    });

    if (!checkoutSession.url) {
      return {
        statusCode: 500,
        success: false,
        message: "Failed to create a payment session.",
      };
    }

    return {
      statusCode: 200,
      success: true,
      message: "Redirecting to payment.",
      data: { checkoutUrl: checkoutSession.url },
    };
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return serverErrorResponse("Failed to start checkout. Please try again.");
  }
};
