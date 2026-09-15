import { describe, expect, it } from "vitest";
import {
  getPathList,
  originalPriceGetter,
  priceFormatter,
  timeFormatter,
} from "./helper";

describe("priceFormatter", () => {
  it("formats dollars as USD", () => {
    expect(priceFormatter(1234.5)).toBe("$1,234.50");
    expect(priceFormatter(0)).toBe("$0.00");
  });
});

describe("originalPriceGetter", () => {
  it("back-computes the pre-discount price", () => {
    expect(originalPriceGetter(80, 20)).toBe(100);
  });

  it("handles zero discount", () => {
    expect(originalPriceGetter(50, 0)).toBe(50);
  });
});

describe("getPathList", () => {
  it("builds cumulative breadcrumb segments with home first", () => {
    const segments = getPathList("/products/abc123");
    expect(segments[0]).toEqual({ label: "home", value: "/" });
    expect(segments[1]).toEqual({ label: "products", value: "/products" });
    expect(segments[2].value).toBe("/products/abc123");
  });

  it("truncates long labels", () => {
    const segments = getPathList("/products/some-very-long-product-id");
    expect(segments[2].label.length).toBeLessThanOrEqual(13); // 10 + "..."
  });
});

describe("timeFormatter", () => {
  it("returns a human-readable date string", () => {
    const out = timeFormatter(new Date("2024-10-05T14:30:00Z"));
    expect(out).toContain("2024");
    expect(out).toContain("October");
  });
});
