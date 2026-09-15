import { expect, test } from "@playwright/test";

test.describe("public routes", () => {
  test("home page renders hero and shop CTA", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("link", { name: /shop/i }).first(),
    ).toBeVisible();
  });

  test("auth page renders sign-in and sign-up tabs", async ({ page }) => {
    await page.goto("/auth");
    await expect(
      page.getByRole("tab", { name: /sign in/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("tab", { name: /sign up/i }),
    ).toBeVisible();
  });
});

test.describe("route protection", () => {
  for (const route of ["/products", "/cart", "/orders", "/wishlist", "/compare", "/profile"]) {
    test(`${route} redirects unauthenticated visitors to /auth`, async ({
      page,
    }) => {
      await page.goto(route);
      await expect(page).toHaveURL(/\/auth/);
    });
  }
});
