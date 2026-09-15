/**
 * App-facing copy of the curated catalog taxonomy used by the seed
 * (prisma/seed/categories.ts). The DB stores each Category with `name`
 * equal to the leaf slug; this map gives those slugs human labels and a
 * two-level navigation structure without a schema tree.
 */

export interface CategoryLeafMeta {
  slug: string;
  label: string;
}

export interface CategoryGroupMeta {
  slug: string;
  label: string;
  leaves: CategoryLeafMeta[];
}

export const CATEGORY_GROUPS: CategoryGroupMeta[] = [
  {
    slug: "electronics",
    label: "Electronics",
    leaves: [
      { slug: "smartphones", label: "Smartphones" },
      { slug: "laptops", label: "Laptops" },
      { slug: "tablets", label: "Tablets" },
      { slug: "headphones", label: "Headphones & Audio" },
      { slug: "mobile-accessories", label: "Mobile Accessories" },
    ],
  },
  {
    slug: "fashion",
    label: "Fashion",
    leaves: [
      { slug: "mens-shirts", label: "Men's Shirts" },
      { slug: "mens-shoes", label: "Men's Shoes" },
      { slug: "mens-watches", label: "Men's Watches" },
      { slug: "womens-dresses", label: "Women's Dresses" },
      { slug: "womens-shoes", label: "Women's Shoes" },
      { slug: "womens-watches", label: "Women's Watches" },
      { slug: "womens-bags", label: "Women's Bags" },
      { slug: "womens-jewellery", label: "Women's Jewellery" },
      { slug: "tops", label: "Tops" },
      { slug: "sunglasses", label: "Sunglasses" },
    ],
  },
  {
    slug: "home-living",
    label: "Home & Living",
    leaves: [
      { slug: "furniture", label: "Furniture" },
      { slug: "home-decoration", label: "Home Decoration" },
      { slug: "kitchen-accessories", label: "Kitchen Accessories" },
    ],
  },
  {
    slug: "beauty-care",
    label: "Beauty & Care",
    leaves: [
      { slug: "beauty", label: "Beauty" },
      { slug: "fragrances", label: "Fragrances" },
      { slug: "skin-care", label: "Skin Care" },
    ],
  },
  {
    slug: "groceries-sports",
    label: "Groceries & Sports",
    leaves: [
      { slug: "groceries", label: "Groceries" },
      { slug: "sports-accessories", label: "Sports Accessories" },
      { slug: "motorcycle", label: "Motorcycle" },
      { slug: "vehicle", label: "Vehicle" },
    ],
  },
];

const leafIndex = new Map<string, { group: CategoryGroupMeta; leaf: CategoryLeafMeta }>();
for (const group of CATEGORY_GROUPS) {
  for (const leaf of group.leaves) {
    leafIndex.set(leaf.slug, { group, leaf });
  }
}

/** Group + leaf metadata for a category slug, or undefined when unknown. */
export function getCategoryMeta(slug: string) {
  return leafIndex.get(slug);
}

/** Human label for a category slug; falls back to a title-cased slug. */
export function categoryLabel(slug: string): string {
  const meta = leafIndex.get(slug);
  if (meta) return meta.leaf.label;
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
