# 0003 — PENDING-order-then-webhook checkout flow

**Status:** Accepted
**Date:** Phase 3 (Stripe integration)

## Context

The old `placeOrderFromCart` created an order, decremented stock, and cleared
the cart **before any payment existed** — free shopping with real inventory
damage.

## Decision

1. `createCheckoutSession` validates cart + address, snapshots line items
   (`unitPrice`, `title`, `thumbnail`) into a **PENDING** order, and opens a
   Stripe Checkout Session bound by `order.id` metadata + unique
   `stripeSessionId`.
2. The `/api/webhooks/stripe` handler is the only writer of fulfillment:
   `checkout.session.completed` → `PAID` + stock decrement + cart clear +
   Resend email; `session.expired` → `CANCELLED`. Handlers are idempotent —
   they only act on `PENDING` orders.

## Consequences

- Stock only moves on confirmed money; abandoning checkout costs nothing.
- Order history shows true payment state; users can cancel
  PENDING/PAID/PLACED orders (stock restored when appropriate).
- Historical order rows are immune to later product price/title changes
  (snapshot columns).
- Requires webhook delivery in every environment (documented via
  `stripe listen` in README; without `STRIPE_SECRET_KEY` checkout degrades to
  a clear 503).
