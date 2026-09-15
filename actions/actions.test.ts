import { beforeEach, describe, expect, it, vi } from "vitest";

// --- Mocks -----------------------------------------------------------------
vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/db", () => ({
  db: {
    cart: { findUnique: vi.fn(), delete: vi.fn() },
    cartItem: {
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
    $transaction: vi.fn((fn) => fn(mockedDb)),
  },
}));

const { auth } = await import("@/auth");
const { db } = await import("@/db");
const mockedDb = db as unknown as Record<string, Record<string, ReturnType<typeof vi.fn>>>;

const authed = () =>
  (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
    user: { id: "user-1", email: "u@example.com", role: "USER" },
  });

const anon = () =>
  (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);

// --- Tests -----------------------------------------------------------------
describe("updateCartItemQuantity", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects unauthenticated calls", async () => {
    anon();
    const { updateCartItemQuantity } = await import("./cart.action");
    const res = await updateCartItemQuantity({
      cartItemId: "item-1",
      quantityChange: 1,
    });
    expect(res.statusCode).toBe(401);
  });

  it("rejects invalid payloads", async () => {
    authed();
    const { updateCartItemQuantity } = await import("./cart.action");
    const res = await updateCartItemQuantity({
      cartItemId: "",
      quantityChange: 1,
    });
    expect(res.statusCode).toBe(400);
  });

  it("blocks items owned by another user (IDOR guard)", async () => {
    authed();
    mockedDb.cartItem.findUnique.mockResolvedValue({
      id: "item-1",
      cartId: "cart-1",
      quantity: 1,
      product: { stock: 5 },
      cart: { userId: "somebody-else" },
    });

    const { updateCartItemQuantity } = await import("./cart.action");
    const res = await updateCartItemQuantity({
      cartItemId: "item-1",
      quantityChange: 1,
    });
    expect(res.statusCode).toBe(404);
    expect(mockedDb.cartItem.update).not.toHaveBeenCalled();
  });

  it("enforces the stock ceiling", async () => {
    authed();
    mockedDb.cartItem.findUnique.mockResolvedValue({
      id: "item-1",
      cartId: "cart-1",
      quantity: 5,
      product: { stock: 5 },
      cart: { userId: "user-1" },
    });

    const { updateCartItemQuantity } = await import("./cart.action");
    const res = await updateCartItemQuantity({
      cartItemId: "item-1",
      quantityChange: 1,
    });
    expect(res.statusCode).toBe(400);
    expect(res.message).toMatch(/stock/i);
  });
});

describe("cancelOrder", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects unauthenticated calls", async () => {
    anon();
    const { cancelOrder } = await import("./order.action");
    expect((await cancelOrder("order-1")).statusCode).toBe(401);
  });

  it("refuses to cancel another user's order", async () => {
    authed();
    (db.order as never) = { findFirst: vi.fn().mockResolvedValue(null) };
    const { cancelOrder } = await import("./order.action");
    expect((await cancelOrder("order-1")).statusCode).toBe(404);
  });

  it("refuses to cancel a delivered order", async () => {
    authed();
    (db.order as never) = {
      findFirst: vi
        .fn()
        .mockResolvedValue({
          id: "order-1",
          status: "DELIVERED",
          items: [],
        }),
    };
    const { cancelOrder } = await import("./order.action");
    const res = await cancelOrder("order-1");
    expect(res.statusCode).toBe(400);
    expect(res.message).toMatch(/DELIVERED/);
  });
});

describe("createCheckoutSession", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 503 when Stripe is not configured", async () => {
    vi.stubEnv("STRIPE_SECRET_KEY", "");
    vi.resetModules();
    authed();
    const { createCheckoutSession } = await import("./checkout.action");
    const res = await createCheckoutSession({ addressId: "addr-1" });
    expect(res.statusCode).toBe(503);
  });
});
