/**
 * Prisma seed script — rebuilds the catalog from scratch.
 *
 * Steps:
 *   1. clear catalog tables (Review, ProductCategory, Product, Category)
 *   2. upsert the demo user (User/Account/Cart/etc. are never touched)
 *   3. fetch every product from dummyjson.com (limit=0) and insert it
 *   4. top each category leaf up to its curated target with deterministic
 *      synthetic products from generator.ts
 *   5. link products to categories via ProductCategory rows
 *   6. seed reviews (dummyjson reviews for real products, generated reviews
 *      for synthetic ones; a handful get reviewerId = demo user) and update
 *      each product's denormalized average rating
 *
 * Usage:
 *   npx prisma db push    # ensure schema is in sync
 *   npx prisma db seed    # run this script (or: npm run seed)
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

import { CATEGORY_GROUPS, leafForDummyjsonSlug } from "./categories";
import { generateProducts } from "./generator";

const db = new PrismaClient();

// ---------------------------------------------------------------------------
// Generated review pool — cycled via a module-level cursor so output stays
// deterministic across runs.
// ---------------------------------------------------------------------------

const GENERATED_REVIEWERS = [
  "Ava Marshall",
  "Liam O'Connell",
  "Sofia Delgado",
  "Noah Whitfield",
  "Mia Kowalski",
  "Ethan Castillo",
  "Isla Brennan",
  "Lucas Moreau",
  "Amara Osei",
  "Owen Gallagher",
  "Nina Petrova",
  "Caleb Whitaker",
  "Priya Raman",
  "Jonas Lindqvist",
  "Elena Vasquez",
  "Marcus Webb",
  "Tara Nguyen",
  "Felix Aubert",
  "Zoe Carlton",
  "Dario Benedetti",
] as const;

const GENERATED_REVIEW_COMMENTS: Record<number, string[]> = {
  3: [
    "Decent for the price, but not perfect.",
    "It is okay — does what it promises, nothing more.",
    "Average quality; I expected a little more.",
    "Works fine with occasional quirks.",
    "Fair value, though there is room for improvement.",
  ],
  4: [
    "Very satisfied — would buy again!",
    "Great quality overall, just minor nitpicks.",
    "Almost perfect. Shipping was quick too.",
    "Solid product that mostly lives up to the hype.",
    "Really good value for money.",
  ],
  5: [
    "Highly impressed!",
    "Exceeded my expectations in every way.",
    "Absolutely love it — five stars well earned.",
    "Fantastic quality, recommended to all my friends.",
    "Perfect. Exactly as described.",
  ],
};

const GENERATED_REVIEWER_EMAIL_DOMAIN = "mail.flipzone.dev";

let reviewerCursor = 0;

function nextGeneratedReviewer(): { name: string; email: string } {
  const name = GENERATED_REVIEWERS[reviewerCursor % GENERATED_REVIEWERS.length];
  reviewerCursor++;
  const email =
    name.toLowerCase().replace(/[^a-z]+/g, ".").replace(/^\.|\.$/g, "") +
    `@${GENERATED_REVIEWER_EMAIL_DOMAIN}`;
  return { name, email };
}

function generatedReviewComment(rating: number): string {
  const pool =
    GENERATED_REVIEW_COMMENTS[rating] ??
    GENERATED_REVIEW_COMMENTS[rating >= 4 ? 4 : 3];
  // Cursor-based pick keeps comments deterministic.
  reviewerCursor++;
  return pool[reviewerCursor % pool.length];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Average a list of review scores, rounded to two decimals (Float field). */
function averageRating(scores: number[]): number {
  if (!scores.length) return 0;
  const total = scores.reduce((sum, s) => sum + s, 0);
  return parseFloat((total / scores.length).toFixed(2));
}

/** Days back from now for a deterministic spread of review dates. */
function reviewDate(ordinal: number): Date {
  // ordinal rotates over the last ~18 months.
  const daysAgo = ((ordinal * 41) % 540) + 1;
  return new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
}

interface DummyjsonProduct {
  reviews?: Array<{
    rating: number;
    comment: string;
    reviewerName?: string;
    reviewerEmail?: string;
    date?: string;
  }>;
  category?: string;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Seed
// ---------------------------------------------------------------------------

async function seed() {
  // Step 0: clear catalog tables. Child rows first; onDelete: Cascade also
  // covers reviews, but explicit order makes the intent obvious. OrderedItem /
  // CartItem / WishlistItem / ComparisonItem reference Product and would
  // violate the relation when products are deleted, so those (and their empty
  // parents) are wiped too — this is a demo catalog reset, not a user-scoped
  // wipe. User/Account/Address stay intact.
  console.log("Clearing catalog tables...");
  await db.orderedItem.deleteMany({});
  await db.order.deleteMany({});
  await db.cartItem.deleteMany({});
  await db.cart.deleteMany({});
  await db.wishlistItem.deleteMany({});
  await db.wishlist.deleteMany({});
  await db.comparisonItem.deleteMany({});
  await db.comparison.deleteMany({});
  await db.review.deleteMany({});
  await db.productCategory.deleteMany({});
  await db.product.deleteMany({});
  await db.category.deleteMany({});

  // Step 1: fetch all dummyjson products (limit=0 returns the full catalog).
  console.log("Fetching products from dummyjson.com...");
  const response = await fetch("https://dummyjson.com/products?limit=0");
  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.status}`);
  }
  const data = (await response.json()) as {
    products?: DummyjsonProduct[];
  };
  const fetchedProducts = data.products ?? [];
  console.log(`Fetched ${fetchedProducts.length} real products.`);

  // Bucket real products by curated leaf slug so synth top-ups can be sized.
  const realsByLeaf = new Map<string, DummyjsonProduct[]>();
  for (const raw of fetchedProducts) {
    const category = raw.category ?? "";
    const mapping = leafForDummyjsonSlug(category);
    if (!mapping) {
      throw new Error(
        `Dummyjson category "${category}" is not mapped in CATEGORY_GROUPS.`,
      );
    }
    const bucket = realsByLeaf.get(mapping.leaf.slug) ?? [];
    bucket.push(raw);
    realsByLeaf.set(mapping.leaf.slug, bucket);
  }

  // Step 2: create one Category row per curated leaf (name = dummyjson slug
  // or synthetic slug, preserving today's naming convention).
  const leafCategoryIds = new Map<string, string>();
  for (const group of CATEGORY_GROUPS) {
    for (const leaf of group.leaves) {
      const created = await db.category.create({ data: { name: leaf.slug } });
      leafCategoryIds.set(leaf.slug, created.id);
    }
  }
  console.log(`Created ${leafCategoryIds.size} categories.`);

  // Step 3: demo user (unchanged from the previous seed).
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

  const groupTotals = new Map<string, number>();
  let totalProducts = 0;
  let totalReviews = 0;

  for (const group of CATEGORY_GROUPS) {
    let groupCount = 0;

    for (const leaf of group.leaves) {
      const categoryId = leafCategoryIds.get(leaf.slug);
      if (!categoryId) throw new Error(`Missing category row for ${leaf.slug}`);

      const reals = realsByLeaf.get(leaf.slug) ?? [];
      const synthCount = Math.max(0, leaf.target - reals.length);

      // --- Real dummyjson products -------------------------------------
      for (const raw of reals) {
        const { id: _id, reviews, category: _category, meta: _meta, ...rest } = raw;
        const {
          rating: _rating,
          availabilityStatus: _availabilityStatus,
          ...productData
        } = rest;

        // Product.price is Int dollars — dummyjson floats (e.g. 0.49) would
        // round to $0; floor at 1 so every product is purchasable.
        const priceInt = Math.max(1, Math.round(Number(productData.price) || 1));

        const reviewScores = (reviews ?? []).map((r) => Number(r.rating) || 0);
        const rating = averageRating(reviewScores);
        const stock = Math.max(0, Math.round(Number(productData.stock) || 0));

        const product = await db.product.create({
          data: {
            ...(productData as Record<string, unknown>),
            price: priceInt,
            stock,
            rating,
            availabilityStatus: stock > 0 ? "In Stock" : "Out of Stock",
          } as never, // dummyjson fields match the Product model loosely
        });

        await db.productCategory.create({
          data: { productId: product.id, categoryId },
        });

        for (const review of reviews ?? []) {
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
          totalReviews++;
        }

        totalProducts++;
        groupCount++;
      }

      // --- Deterministic synthetic top-up ------------------------------
      if (synthCount > 0) {
        const fabrics = generateProducts(group, leaf, synthCount);

        for (const fabric of fabrics) {
          const reviewScores: number[] = [...fabric.reviewRatings];
          // One in six generated products also gets a second review authored
          // by the demo user (deterministic: title length decides).
          const demoReview = fabric.title.length % 6 === 0;
          if (demoReview) reviewScores.push(Math.round(fabric.rating));

          const product = await db.product.create({
            data: {
              title: fabric.title,
              description: fabric.description,
              price: fabric.price,
              discountPercentage: fabric.discountPercentage,
              rating: averageRating(reviewScores),
              stock: fabric.stock,
              brand: fabric.brand,
              sku: fabric.sku,
              weight: fabric.weight,
              tags: fabric.tags,
              images: fabric.images,
              thumbnail: fabric.thumbnail,
              warrantyInformation: fabric.warrantyInformation,
              shippingInformation: fabric.shippingInformation,
              availabilityStatus: fabric.availabilityStatus,
              returnPolicy: fabric.returnPolicy,
              minimumOrderQuantity: fabric.minimumOrderQuantity,
            },
          });

          await db.productCategory.create({
            data: { productId: product.id, categoryId },
          });

          let reviewOrdinal = 0;
          for (const reviewRating of fabric.reviewRatings) {
            const reviewer = nextGeneratedReviewer();
            await db.review.create({
              data: {
                rating: reviewRating,
                comment: generatedReviewComment(reviewRating),
                date: reviewDate(totalReviews + reviewOrdinal),
                reviewerName: reviewer.name,
                reviewerEmail: reviewer.email,
                productId: product.id,
              },
            });
            totalReviews++;
            reviewOrdinal++;
          }

          if (demoReview) {
            await db.review.create({
              data: {
                rating: Math.round(fabric.rating),
                comment: "Verified purchase — matches the description.",
                date: reviewDate(totalReviews + reviewOrdinal),
                reviewerName: "Demo User",
                reviewerEmail: demoUser.email,
                reviewerId: demoUser.id,
                productId: product.id,
              },
            });
            totalReviews++;
          }

          totalProducts++;
          groupCount++;
        }
      }
    }

    groupTotals.set(group.slug, groupCount);
  }

  // Summary
  console.log("\n--- Seed summary ---");
  for (const group of CATEGORY_GROUPS) {
    console.log(`  ${group.label}: ${groupTotals.get(group.slug) ?? 0} products`);
  }
  console.log(`  Total products: ${totalProducts}`);
  console.log(`  Total reviews:  ${totalReviews}`);
  console.log("Done!");
}

seed()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
