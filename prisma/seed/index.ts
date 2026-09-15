/**
 * Prisma seed script — populates the database with products, categories,
 * and reviews from dummyjson.com.
 *
 * Usage:
 *   npx prisma db push    # ensure schema is in sync
 *   npx prisma db seed    # run this script
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function seed() {
  console.log("Fetching products from dummyjson.com...");

  const response = await fetch("https://dummyjson.com/products?limit=100");
  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.status}`);
  }

  const data = (await response.json()) as {
    products: Array<Record<string, unknown>>;
  };
  const fetchedProducts = data.products;

  if (!fetchedProducts?.length) {
    console.log("No products to seed.");
    return;
  }

  console.log(`Seeding ${fetchedProducts.length} products...`);

  // Step 1: Extract unique categories and upsert them
  const categoryNames = Array.from(
    new Set(
      fetchedProducts.map(
        (p) => (p as Record<string, unknown>).category as string,
      ),
    ),
  );

  const categoryEntries = await Promise.all(
    categoryNames.map((name) =>
      db.category.upsert({
        where: { name },
        update: {},
        create: { name },
      }),
    ),
  );

  console.log(`Upserted ${categoryEntries.length} categories.`);

  // Step 2: Create a demo user for reviews
  const demoUser = await db.user.upsert({
    where: { email: "demo@flipzone.dev" },
    update: {},
    create: {
      email: "demo@flipzone.dev",
      name: "Demo User",
      password: await bcrypt.hash("DemoPass123", 10),
      role: "USER",
    },
  });

  console.log(`Demo user: ${demoUser.email}`);

  // Step 3: Create products, link categories, and seed reviews
  let created = 0;

  for (const raw of fetchedProducts) {
    const {
      id: _id,
      reviews,
      category,
      ...productData
    } = raw as Record<string, unknown> & {
      reviews?: Array<{
        rating: number;
        comment: string;
        reviewerName?: string;
        reviewerEmail?: string;
        date?: string;
      }>;
      category?: string;
    };

    // Calculate average rating from reviews
    let rating = 0;
    if (reviews && reviews.length > 0) {
      const total = reviews.reduce((sum, r) => sum + r.rating, 0);
      rating = total / reviews.length;
    }

    const product = await db.product.create({
      data: {
        ...(productData as Record<string, unknown>),
        rating: parseFloat(rating.toFixed(2)),
      } as never, // dummyjson fields match the Product model loosely
    });

    // Link category
    if (category) {
      const categoryEntry = categoryEntries.find((c) => c.name === category);
      if (categoryEntry) {
        await db.productCategory.create({
          data: {
            productId: product.id,
            categoryId: categoryEntry.id,
          },
        });
      }
    }

    // Seed reviews
    if (reviews && reviews.length > 0) {
      await Promise.all(
        reviews.map(async (review) => {
          await db.review.create({
            data: {
              rating: review.rating,
              comment: review.comment,
              date: review.date ? new Date(review.date) : new Date(),
              reviewerName: review.reviewerName || "Anonymous",
              reviewerEmail: review.reviewerEmail || "",
              reviewerId: demoUser.id,
              productId: product.id,
            },
          });
        }),
      );
    }

    created++;
  }

  console.log(`Seeded ${created} products with categories and reviews.`);
  console.log("Done!");
}

seed()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
