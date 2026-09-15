import Stripe from "stripe";

export const getStripe = () => {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, { typescript: true });
};

export const toStripeAmount = (price: number) => Math.round(price * 100);
