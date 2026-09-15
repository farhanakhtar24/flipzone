import { beforeEach, describe, expect, it, vi } from "vitest";

// --- Mocks (hoisted before imports of the modules under test) --------------
vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/db", () => ({
  db: {
    order: { findFirst: vi.fn(), update: vi.fn() },
    cart: { findUnique: vi.fn(), delete: vi.fn() },
    cartItem: {
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
    $transaction: vi.fn((fn: (tx: unknown) => unknown) => fn(mockedDb)),
  },
}));

import { auth } from "@/auth";
import { db } from "@/db";

const mockedAuth = vi.mocked(auth);
const mockedDb = vi.mocked(db, { deep: true });

const authed = () =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mockedAuth.mockResolvedValue({
    user: { id: "user-1", email: "u@example.com", role: "USER" },
  } as any);
const anon = () =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mockedAuth.mockResolvedValue(null as any);

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockedDb.cartItem.findUnique.mockResolvedValue({
      id: "item-1",
      cartId: "cart-1",
      quantity: 1,
      product: { stock: 5 },
      cart: { userId: "somebody-else" },
    } as any);

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockedDb.cartItem.findUnique.mockResolvedValue({
      id: "item-1",
      cartId: "cart-1",
      quantity: 5,
      product: { stock: 5 },
      cart: { userId: "user-1" },
    } as any);

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockedDb.order.findFirst.mockResolvedValue(null as any);
    const { cancelOrder } = await import("./order.action");
    expect((await cancelOrder("order-1")).statusCode).toBe(404);
  });

  it("refuses to cancel a delivered order", async () => {
    authed();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockedDb.order.findFirst.mockResolvedValue({
      id: "order-1",
      status: "DELIVERED",
      items: [],
    } as any);
    const { cancelOrder } = await import("./order.action");
    const res = await cancelOrder("order-1");
    expect(res.statusCode).toBe(400);
    expect(res.message).toMatch(/DELIVERED/);
  });
});
