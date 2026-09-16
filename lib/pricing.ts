import { priceFormatter } from "@/util/helper";

/**
 * Single source of truth for cart math. Used by the cart page, mini-cart
 * drawer, and echoed in Stripe line items at checkout. Keep every rule in
 * here so the three surfaces never diverge.
 *
 * Rules:
 *  - Free shipping at/above FREE_SHIPPING_THRESHOLD, else SHIPPING_FLAT.
 *  - Discount display only (Strike-through MRP vs sale price); Stripe
 *    promotion codes are applied at checkout, not here.
 */

export const FREE_SHIPPING_THRESHOLD = 50; // dollars
export const SHIPPING_FLAT = 5; // dollars

export type CartTotalsInput = Array<{
  quantity: number;
  product: { price: number; discountPercentage?: number | null };
}>;

export type CartTotals = {
  totalMRP: number; // sum of pre-discount prices
  totalDiscount: number; // MRP − sale subtotal
  subtotal: number; // what we charge before shipping
  shipping: number; // 0 when free
  total: number; // subtotal + shipping
  itemCount: number;
  /** formatted helpers for direct rendering */
  formatted: {
    totalMRP: string;
    totalDiscount: string;
    subtotal: string;
    shipping: string;
    total: string;
  };
};

const originalUnitPrice = (price: number, discount?: number | null) =>
  discount ? Math.round(price / (1 - discount / 100)) : price;

export const getCartTotals = (items: CartTotalsInput): CartTotals => {
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0,
  );
  const totalMRP = items.reduce(
    (sum, i) =>
      sum +
      originalUnitPrice(i.product.price, i.product.discountPercentage) *
        i.quantity,
    0,
  );
  const totalDiscount = totalMRP - subtotal;
  const shipping =
    subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_FLAT;
  const total = subtotal + shipping;

  return {
    totalMRP,
    totalDiscount,
    subtotal,
    shipping,
    total,
    itemCount,
    formatted: {
      totalMRP: priceFormatter(totalMRP),
      totalDiscount: priceFormatter(totalDiscount),
      subtotal: priceFormatter(subtotal),
      shipping: shipping === 0 ? "Free" : priceFormatter(shipping),
      total: priceFormatter(total),
    },
  };
};
