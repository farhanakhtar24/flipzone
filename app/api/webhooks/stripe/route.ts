import { db } from "@/db";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { getStripe } from "@/lib/stripe";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

/**
 * Stripe webhook receiver. Must read the raw body for signature
 * verification — Next.js App Router gives us the raw stream via
 * `request.text()` as long as we don't parse JSON first.
 */
export const POST = async (request: Request) => {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !webhookSecret) {
    return NextResponse.json(
      { error: "Stripe is not configured." },
      { status: 503 },
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    console.error("Stripe webhook signature verification failed:", error);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const checkoutSession = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(checkoutSession);
        break;
      }
      case "checkout.session.expired": {
        const checkoutSession = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutExpired(checkoutSession);
        break;
      }
      default:
        break;
    }
  } catch (error) {
    console.error(`Error handling Stripe event ${event.type}:`, error);
    return NextResponse.json(
      { error: "Webhook handler failed." },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
};

const handleCheckoutCompleted = async (
  checkoutSession: Stripe.Checkout.Session,
) => {
  const orderId = checkoutSession.metadata?.orderId;
  if (!orderId) return;

  // Idempotency: only act on PENDING orders so retries are no-ops.
  const order = await db.order.findFirst({
    where: { id: orderId, status: "PENDING" },
    include: { items: true, user: { select: { email: true } } },
  });
  if (!order) return;

  const paymentIntentId =
    typeof checkoutSession.payment_intent === "string"
      ? checkoutSession.payment_intent
      : checkoutSession.payment_intent?.id;

  await db.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: order.id },
      data: {
        status: "PAID",
        stripePaymentIntentId: paymentIntentId,
      },
    });

    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    const cart = await tx.cart.findUnique({ where: { userId: order.userId } });
    if (cart) {
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      await tx.cart.delete({ where: { id: cart.id } });
    }
  });

  if (order.user.email) {
    await sendOrderConfirmationEmail({
      to: order.user.email,
      orderId: order.id,
      total: order.total,
      items: order.items.map((item) => ({
        title: item.title,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    });
  }
};

const handleCheckoutExpired = async (
  checkoutSession: Stripe.Checkout.Session,
) => {
  const orderId = checkoutSession.metadata?.orderId;
  if (!orderId) return;

  // Abandoned checkout — cancel the pending order so it doesn't clutter
  // the user's history. Paid orders are never touched here.
  await db.order.updateMany({
    where: { id: orderId, status: "PENDING" },
    data: { status: "CANCELLED" },
  });
};
