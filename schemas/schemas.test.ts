import { describe, expect, it } from "vitest";
import { AddressSchema } from "./address";
import { LoginSchema, SignUpSchema } from "./auth";
import { UpdateCartItemQuantitySchema } from "./cart";
import { ReviewSchema } from "./product";
import { UpdateUserSchema } from "./user";

describe("AddressSchema", () => {
  const valid = {
    fullName: "Jane Doe",
    line1: "123 Main St",
    city: "Springfield",
    state: "IL",
    postalCode: "62701",
  };

  it("accepts a minimal valid address and defaults country to US", () => {
    const parsed = AddressSchema.parse(valid);
    expect(parsed.country).toBe("US");
  });

  it("rejects when required fields are missing", () => {
    expect(AddressSchema.safeParse({}).success).toBe(false);
  });

  it("rejects an over-long street line", () => {
    expect(
      AddressSchema.safeParse({ ...valid, line1: "x".repeat(201) }).success,
    ).toBe(false);
  });
});

describe("SignUpSchema", () => {
  it("rejects weak passwords", () => {
    expect(
      SignUpSchema.safeParse({
        name: "Jane",
        email: "jane@example.com",
        password: "123",
      }).success,
    ).toBe(false);
  });

  it("accepts a compliant password", () => {
    const result = SignUpSchema.safeParse({
      name: "Jane Doe",
      email: "jane@example.com",
      password: "SecurePass1",
    });
    expect(result.success).toBe(true);
  });
});

describe("LoginSchema", () => {
  it("requires email and password", () => {
    expect(LoginSchema.safeParse({ email: "", password: "" }).success).toBe(
      false,
    );
  });
});

describe("UpdateCartItemQuantitySchema", () => {
  it("allows a +1/-1 style delta", () => {
    expect(
      UpdateCartItemQuantitySchema.safeParse({
        cartItemId: "abc",
        quantityChange: 1,
      }).success,
    ).toBe(true);
  });

  it("rejects zero change", () => {
    expect(
      UpdateCartItemQuantitySchema.safeParse({
        cartItemId: "abc",
        quantityChange: 0,
      }).success,
    ).toBe(false);
  });

  it("caps absurd deltas", () => {
    expect(
      UpdateCartItemQuantitySchema.safeParse({
        cartItemId: "abc",
        quantityChange: 10_000,
      }).success,
    ).toBe(false);
  });
});

describe("ReviewSchema", () => {
  it("bounds rating to 1–5", () => {
    const base = { comment: "Great!", productId: "p1", rating: 5 };
    expect(ReviewSchema.safeParse(base).success).toBe(true);
    expect(ReviewSchema.safeParse({ ...base, rating: 6 }).success).toBe(false);
    expect(ReviewSchema.safeParse({ ...base, rating: 0 }).success).toBe(false);
  });

  it("rejects empty comments", () => {
    expect(
      ReviewSchema.safeParse({ comment: "", productId: "p1", rating: 4 })
        .success,
    ).toBe(false);
  });
});

describe("UpdateUserSchema", () => {
  it("accepts partial updates", () => {
    expect(UpdateUserSchema.safeParse({ name: "New Name" }).success).toBe(
      true,
    );
  });

  it("validates gender enum", () => {
    expect(
      UpdateUserSchema.safeParse({ gender: "OTHER" as never }).success,
    ).toBe(false);
    expect(UpdateUserSchema.safeParse({ gender: "FEMALE" }).success).toBe(
      true,
    );
  });
});
