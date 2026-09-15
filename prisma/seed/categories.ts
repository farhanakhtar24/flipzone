/**
 * Curated catalog taxonomy for the seed.
 *
 * Every dummyjson category slug maps into exactly one leaf (and therefore one
 * top-level group) so real products are never orphaned. Leaves with
 * `dummyjson: null` are synthetic-only: their entire catalog comes from the
 * deterministic generator in generator.ts (e.g. headphones, which dummyjson
 * does not carry).
 */

export interface CategoryLeaf {
  /** Slug used for the Category row (`name` in the schema is this slug). */
  slug: string;
  /** Human-readable label. */
  label: string;
  /** The dummyjson slug this leaf absorbs; null => synthetic-only category. */
  dummyjson: string | null;
  /** Number of products this leaf should carry in the final catalog. */
  target: number;
}

export interface CategoryGroup {
  slug: string;
  label: string;
  leaves: CategoryLeaf[];
}

export const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    slug: "electronics",
    label: "Electronics",
    leaves: [
      { slug: "smartphones", label: "Smartphones", dummyjson: "smartphones", target: 30 },
      { slug: "laptops", label: "Laptops", dummyjson: "laptops", target: 26 },
      { slug: "tablets", label: "Tablets", dummyjson: "tablets", target: 23 },
      { slug: "headphones", label: "Headphones & Audio", dummyjson: null, target: 25 },
      {
        slug: "mobile-accessories",
        label: "Mobile Accessories",
        dummyjson: "mobile-accessories",
        target: 27,
      },
    ],
  },
  {
    slug: "fashion",
    label: "Fashion",
    leaves: [
      { slug: "mens-shirts", label: "Men's Shirts", dummyjson: "mens-shirts", target: 21 },
      { slug: "mens-shoes", label: "Men's Shoes", dummyjson: "mens-shoes", target: 21 },
      { slug: "mens-watches", label: "Men's Watches", dummyjson: "mens-watches", target: 21 },
      {
        slug: "womens-dresses",
        label: "Women's Dresses",
        dummyjson: "womens-dresses",
        target: 21,
      },
      { slug: "womens-shoes", label: "Women's Shoes", dummyjson: "womens-shoes", target: 21 },
      {
        slug: "womens-watches",
        label: "Women's Watches",
        dummyjson: "womens-watches",
        target: 21,
      },
      { slug: "womens-bags", label: "Women's Bags", dummyjson: "womens-bags", target: 21 },
      {
        slug: "womens-jewellery",
        label: "Women's Jewellery",
        dummyjson: "womens-jewellery",
        target: 21,
      },
      { slug: "tops", label: "Tops", dummyjson: "tops", target: 16 },
      { slug: "sunglasses", label: "Sunglasses", dummyjson: "sunglasses", target: 16 },
    ],
  },
  {
    slug: "home-living",
    label: "Home & Living",
    leaves: [
      { slug: "furniture", label: "Furniture", dummyjson: "furniture", target: 26 },
      {
        slug: "home-decoration",
        label: "Home Decoration",
        dummyjson: "home-decoration",
        target: 26,
      },
      {
        slug: "kitchen-accessories",
        label: "Kitchen Accessories",
        dummyjson: "kitchen-accessories",
        target: 28,
      },
    ],
  },
  {
    slug: "beauty-care",
    label: "Beauty & Care",
    leaves: [
      { slug: "beauty", label: "Beauty", dummyjson: "beauty", target: 20 },
      { slug: "fragrances", label: "Fragrances", dummyjson: "fragrances", target: 20 },
      { slug: "skin-care", label: "Skin Care", dummyjson: "skin-care", target: 23 },
    ],
  },
  {
    slug: "groceries-sports",
    label: "Groceries & Sports",
    leaves: [
      { slug: "groceries", label: "Groceries", dummyjson: "groceries", target: 30 },
      {
        slug: "sports-accessories",
        label: "Sports Accessories",
        dummyjson: "sports-accessories",
        target: 20,
      },
      { slug: "motorcycle", label: "Motorcycle", dummyjson: "motorcycle", target: 5 },
      { slug: "vehicle", label: "Vehicle", dummyjson: "vehicle", target: 5 },
    ],
  },
];

/** Total catalog size implied by the leaf targets (~550). */
export const TOTAL_TARGET = CATEGORY_GROUPS.flatMap((g) => g.leaves).reduce(
  (sum, leaf) => sum + leaf.target,
  0,
);

/** Look up the leaf (and its group) for a dummyjson category slug. */
export function leafForDummyjsonSlug(slug: string):
  | { group: CategoryGroup; leaf: CategoryLeaf }
  | undefined {
  for (const group of CATEGORY_GROUPS) {
    for (const leaf of group.leaves) {
      if (leaf.dummyjson === slug) return { group, leaf };
    }
  }
  return undefined;
}
