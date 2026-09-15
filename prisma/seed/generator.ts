/**
 * Deterministic synthetic product generator for the seed.
 *
 * Uses a mulberry32 PRNG (no npm deps) seeded with a fixed constant, so every
 * run of `npm run seed` fabricates exactly the same catalog. All generated
 * products honor the Prisma Product schema:
 *   - price: INTEGER dollars, always >= 1
 *   - rating: one decimal in [3.2, 5.0]
 *   - stock: 0..120 (some products intentionally end up out of stock)
 *   - images/thumbnail: picsum.photos URLs with seed `flipzone-<slug>-<n>`
 */

import type { CategoryGroup, CategoryLeaf } from "./categories";

// ---------------------------------------------------------------------------
// PRNG helpers
// ---------------------------------------------------------------------------

/** mulberry32 — tiny deterministic PRNG. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fixed seed => identical output on every seed run. */
const rng = mulberry32(0xF11F20);

function next(): number {
  return rng();
}

function int(min: number, max: number): number {
  return min + Math.floor(next() * (max - min + 1));
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(next() * arr.length)];
}

function pickTwo<T>(arr: readonly T[]): [T, T] {
  const first = pick(arr);
  let second = pick(arr);
  // Avoid identical pairs for phrases like "maple with maple".
  let guard = 0;
  while (arr.length > 1 && second === first && guard < 10) {
    second = pick(arr);
    guard++;
  }
  return [first, second];
}

// ---------------------------------------------------------------------------
// Generated fabric type — everything index.ts needs to insert a Product.
// ---------------------------------------------------------------------------

export interface GeneratedProductFabric {
  title: string;
  description: string;
  price: number; // integer dollars
  discountPercentage?: number;
  rating: number; // one decimal, 3.2–5.0
  stock: number; // 0–120
  brand: string;
  sku: string;
  weight?: number; // kg, dummyjson style
  tags: string[];
  images: string[];
  thumbnail: string;
  warrantyInformation: string;
  shippingInformation: string;
  availabilityStatus: string; // "In Stock" | "Out of Stock"
  returnPolicy: string;
  minimumOrderQuantity: number;
    /** Review ratings (integers 3–5) matching this product's average rating. */
  reviewRatings: number[];
}

// ---------------------------------------------------------------------------
// Shared pools
// ---------------------------------------------------------------------------

const BRANDS: Record<string, readonly string[]> = {
  electronics: ["Voltaic", "Nimbus", "Aurora", "Pixelon", "Quark"],
  fashion: ["Meridian", "Solstice", "Vireo", "Tailor & Thread", "Northloom"],
  "home-living": ["Hearthline", "Oak & Ember", "Casa Verde", "Driftwood", "Loomhouse"],
  "beauty-care": ["Lumen", "Botanica", "Veaula", "Rosehip Lab", "Clarity"],
  "groceries-sports": ["Harvest & Hill", "Trailbloc", "Summit Provisions", "Fieldstone", "Apex Trail"],
};

const SHIPPING_OPTIONS = [
  "Ships in 1-2 business days",
  "Ships in 3-5 business days",
  "Ships in 1 week",
  "Ships overnight",
] as const;

const RETURN_OPTIONS = [
  "30 days return policy",
  "7 days return policy",
  "60 days return policy",
  "90 days return policy",
  "No return policy",
] as const;

const WARRANTY_OPTIONS: Record<string, readonly string[]> = {
  electronics: ["1 year warranty", "2 year warranty", "3 year warranty", "6 months warranty"],
  fashion: ["No warranty", "1 month warranty", "3 months warranty"],
  "home-living": ["5 year warranty", "2 year warranty", "1 year warranty", "6 months warranty"],
  "beauty-care": ["No warranty", "1 month warranty", "3 months warranty"],
  "groceries-sports": ["No warranty", "6 months warranty", "1 year warranty"],
};

const DISCOUNT_VALUES = [5, 10, 15, 20, 25, 30, 40, 50] as const;

// ---------------------------------------------------------------------------
// Naming helpers
// ---------------------------------------------------------------------------

function phoneName(brand: string): { name: string; spec: string } {
  const model = pick(["One", "Nova", "Edge", "Pulse", "Flux", "Prime", "Lite", "Ultra"]);
  const mem = pick(["8GB/128GB", "8GB/256GB", "12GB/256GB", "12GB/512GB"]);
  return { name: `${brand} ${model} 5G Smartphone ${mem}`, spec: `${mem} with 5G connectivity` };
}

function laptopName(brand: string): { name: string; spec: string } {
  const line = pick(["Pro", "Air", "Zen", "Core", "Flex"]);
  const screen = pick(['13"', '14"', '15.6"', '16"']);
  const cpu = pick(["i5", "i7", "Ryzen 5", "Ryzen 7"]).toUpperCase();
  const cfg = pick(["8GB/256GB", "16GB/512GB", "16GB/1TB", "32GB/1TB"]);
  const cfgFmt = cfg.replace("/", "/");
  return {
    name: `${brand} ${line} ${screen} Laptop ${cpu}/${cfgFmt}`,
    spec: `${cpu} with ${cfgFmt} memory and storage`,
  };
}

function tabletName(brand: string): { name: string; spec: string } {
  const line = pick(["Tab", "Slate", "Pad"]);
  const screen = pick(['8"', '10"', '11"', '12.4"']);
  const cfg = pick(["64GB", "128GB", "256GB"]);
  return { name: `${brand} ${line} ${screen} Tablet ${cfg} Wi-Fi`, spec: `${screen} display with ${cfg} storage` };
}

function headphoneName(brand: string): { name: string; spec: string } {
  const style = pick([
    { t: "X1", d: "Noise-Cancelling Headphones", s: "active noise cancellation" },
    { t: "X2", d: "True Wireless Earbuds", s: "true wireless design" },
    { t: "Studio", d: "Over-Ear Studio Headphones", s: "over-ear studio sound" },
    { t: "Sport", d: "Bone-Conduction Sport Headphones", s: "open-ear bone conduction" },
    { t: "Air", d: "Wireless On-Ear Headphones", s: "on-ear wireless comfort" },
  ]);
  return { name: `${brand} ${style.t} ${style.d}`, spec: style.s };
}

function mobileAccessoryName(brand: string): { name: string; spec: string } {
  const item = pick([
    ["Magnetic Wireless Charger 15W", "15W magnetic wireless charging"],
    ["Braided USB-C Cable 2m", "2m braided USB-C design"],
    ["Clear Protective Case", "slim transparent protection"],
    ["Tempered Glass Screen Protector 2-Pack", "tempered glass screen protection"],
    ["10000mAh Power Bank", "10000mAh portable capacity"],
    ["GaN Fast Charger 65W", "65W GaN fast charging"],
    ["Adjustable Phone Stand", "adjustable aluminum frame"],
  ] as const);
  return { name: `${brand} ${item[0]}`, spec: item[1] };
}

const CLOTHING_COLORS = ["Black", "White", "Navy", "Olive", "Charcoal", "Sand", "Burgundy", "Slate"];

function clothingSize(): string {
  return pick(["S", "M", "L", "XL", "XXL"]);
}

function shoeSize(): string {
  return pick(["7", "8", "9", "10", "11"]);
}

function mensShirtName(brand: string): { name: string; spec: string } {
  const style = pick(["Oxford", "Chino", "Flannel", "Linen", "Denim", "Polo"]);
  const color = pick(CLOTHING_COLORS);
  const size = clothingSize();
  return { name: `${brand} ${color} ${style} Shirt — Size ${size}`, spec: `${color.toLowerCase()} ${style.toLowerCase()}, size ${size}` };
}

function topsName(brand: string): { name: string; spec: string } {
  const style = pick(["Crewneck Tee", "V-Neck Tee", "Ribbed Tank", "Crop Top", "Henley Top", "Blouse"]);
  const color = pick(CLOTHING_COLORS);
  const size = clothingSize();
  return { name: `${brand} ${color} ${style} — Size ${size}`, spec: `${color.toLowerCase()} ${style.toLowerCase()}, size ${size}` };
}

function womensDressName(brand: string): { name: string; spec: string } {
  const style = pick(["Maxi", "Midi", "Wrap", "Slip", "Sundress", "Shirt"]);
  const color = pick(CLOTHING_COLORS);
  const size = clothingSize();
  return { name: `${brand} ${color} ${style} Dress — Size ${size}`, spec: `${color.toLowerCase()} ${style.toLowerCase()} dress, size ${size}` };
}

function shoeName(brand: string, who: "Men's" | "Women's"): { name: string; spec: string } {
  const style = who === "Men's"
    ? pick(["Runner", "Derby", "Chelsea Boot", "Loafer", "Court Sneaker", "Trail Shoe"])
    : pick(["Runner", "Ballet Flat", "Block Heel", "Chelsea Boot", "Court Sneaker", "Espadrille"]);
  const color = pick(CLOTHING_COLORS);
  const size = shoeSize();
  return { name: `${brand} ${who} ${color} ${style} — Size ${size}`, spec: `${color.toLowerCase()} ${style.toLowerCase()}, size ${size}` };
}

function watchName(brand: string, who: "Men's" | "Women's"): { name: string; spec: string } {
  const style = pick(["Chronograph", "Minimal", "Diver", "Field", "Automatic", "Dress"]);
  const strap = pick(["Leather Strap", "Steel Bracelet", "Mesh Band", "Nylon Strap"]);
  return { name: `${brand} ${who} ${style} Watch ${strap}`, spec: `${strap.toLowerCase()} ${style.toLowerCase()} movement` };
}

function bagName(brand: string): { name: string; spec: string } {
  const style = pick(["Tote", "Crossbody", "Shoulder Bag", "Satchel", "Hobo Bag", "Clutch"]);
  const mat = pick(["Leather", "Canvas", "Saffiano", "Vegan Leather"]);
  return { name: `${brand} ${mat} ${style}`, spec: `${mat.toLowerCase()} construction` };
}

function jewelleryName(brand: string): { name: string; spec: string } {
  const style = pick([
    ["Hoop Earrings", "polished hoops"],
    ["Pendant Necklace", "delicate pendant"],
    ["Tennis Bracelet", "pavé-set stones"],
    ["Stacking Ring Set", "stackable bands"],
    ["Stud Earrings", "classic studs"],
  ] as const);
  const mat = pick(["Gold-Plated", "Sterling Silver", "Rose Gold-Plated"]);
  return { name: `${brand} ${mat} ${style[0]}`, spec: `${mat.toLowerCase()} ${style[1]}` };
}

function sunglassesName(brand: string): { name: string; spec: string } {
  const shape = pick(["Aviator", "Wayfarer", "Round", "Cat-Eye", "Square", "Clubmaster"]);
  const tint = pick(["Smoke", "Gradient Brown", "Green", "Mirrored Blue"]);
  return { name: `${brand} ${shape} Sunglasses ${tint} Lens`, spec: `${tint.toLowerCase()} lenses with UV400 protection` };
}

const WOOD_MATS = ["oak", "walnut", "pine", "maple"];
const UPHOLSTERY = ["charcoal fabric", "oat linen", "taupe velvet"];

function furnitureName(brand: string): { name: string; spec: string } {
  const item = pick([
    () => {
      const [wood] = pickTwo(WOOD_MATS);
      const d = `${int(60, 120)}x${int(40, 80)}cm`;
      return { name: `${brand} ${cap(wood)} Coffee Table ${d}`, spec: `solid ${wood} construction, ${d} footprint` };
    },
    () => {
      const wood = pick(WOOD_MATS);
      const d = `${int(120, 200)}x${int(35, 50)}cm`;
      return { name: `${brand} ${cap(wood)} Bookshelf ${d}`, spec: `${wood} shelving unit, ${d}` };
    },
    () => {
      const fab = pick(UPHOLSTERY);
      const seats = pick(["2", "3"]);
      return { name: `${brand} ${seats}-Seater Sofa in ${cap(fab)}`, spec: `${seats}-seat sofa in ${fab}` };
    },
    () => {
      const wood = pick(WOOD_MATS);
      return { name: `${brand} ${cap(wood)} Dining Chair Set of 2`, spec: `${wood} dining chairs, set of 2` };
    },
    () => {
      const wood = pick(WOOD_MATS);
      return { name: `${brand} ${cap(wood)} Queen Bed Frame`, spec: `${wood} platform frame, queen size` };
    },
  ] as const);
  return item();
}

function homeDecorationName(brand: string): { name: string; spec: string } {
  const item = pick([
    () => {
      const n = int(2, 4);
      return { name: `${brand} Ceramic Vase Set of ${n}`, spec: `matte ceramic vases, set of ${n}` };
    },
    () => {
      const d = `${int(40, 80)}cm`;
      return { name: `${brand} Round Wall Mirror ${d}`, spec: `${d} round mirror with slim frame` };
    },
    () => ({ name: `${brand} Scented Soy Candle Trio`, spec: "three hand-poured soy candles" }),
    () => {
      const d = `${int(120, 200)}x${int(160, 290)}cm`;
      return { name: `${brand} Wool Area Rug ${d}`, spec: `hand-tufted wool, ${d}` };
    },
    () => ({
      name: `${brand} Brass Table Lamp ${int(35, 55)}cm`,
      spec: "brushed brass finish with fabric shade",
    }),
  ] as const);
  return item();
}

function kitchenName(brand: string): { name: string; spec: string } {
  const item = pick([
    ["Cast Iron Skillet", pick(['10"', '12"']), "pre-seasoned cast iron"],
    ["Stainless Saucepan Set", "3-Piece", "tri-ply stainless steel"],
    ["Chef Knife", pick(['6"', '8"']), "high-carbon stainless blade"],
    ["Nonstick Frying Pan", pick(['8"', '10"', '12"']), "PFOA-free nonstick coating"],
    ["Bamboo Cutting Board Set", "2-Piece", "end-grain bamboo"],
    ["Glass Food Storage Set", "10-Piece", "airtight borosilicate glass"],
    ["Pour-Over Coffee Set", "4-Piece", "borosilicate carafe with stainless filter"],
  ] as const);
  return { name: `${brand} ${item[0]} ${item[1]}`, spec: item[2] };
}

function beautyName(brand: string): { name: string; spec: string } {
  const item = pick([
    ["Matte Lipstick", pick(["Crimson", "Nude", "Mauve", "Berry"]), "long-wear matte finish"],
    ["Volumizing Mascara", "Black", "lash-volumizing formula"],
    ["Hydrating Face Serum", "30ml", "hyaluronic acid boost"],
    ["Gel Nail Polish", pick(["Rouge", "Blush", "Taupe"]), "chip-resistant gel shine"],
    ["Liquid Eyeliner", "Jet Black", "smudge-proof precision tip"],
  ] as const);
  return { name: `${brand} ${item[0]} — ${item[1]}`, spec: item[2] };
}

function fragranceName(brand: string): { name: string; spec: string } {
  const mood = pick(["Ambre", "Citrus", "Cedar", "Fleur", "Musk", "Vert"]);
  const size = pick(["50ml", "100ml"]);
  return { name: `${brand} ${mood} Eau de Parfum ${size}`, spec: `eau de parfum, ${size} bottle` };
}

function skinCareName(brand: string): { name: string; spec: string } {
  const item = pick([
    ["Daily Moisturizer SPF 30", "50ml", "broad-spectrum SPF 30"],
    ["Gentle Foaming Cleanser", "150ml", "pH-balanced cleansing"],
    ["Vitamin C Serum", "30ml", "brightening 15% vitamin C"],
    ["Retinol Night Cream", "50ml", "0.3% retinol renewal"],
    ["Hydrating Sheet Masks", "5-Pack", "intensive hydration"],
  ] as const);
  return { name: `${brand} ${item[0]} ${item[1]}`, spec: item[2] };
}

function groceryName(brand: string): { name: string; spec: string } {
  const item = pick([
    ["Organic Rolled Oats", "1kg", "whole-grain organic oats"],
    ["Raw Wildflower Honey", "500g", "unfiltered raw honey"],
    ["Arabica Ground Coffee", "340g", "medium-roast arabica"],
    ["Extra Virgin Olive Oil", "750ml", "cold-pressed EVOO"],
    ["Sea Salt Almonds", "250g", "roasted with sea salt"],
    ["Organic Quinoa", "900g", "pre-washed organic quinoa"],
    ["Dark Chocolate Bar", "100g", "70% cacao dark chocolate"],
    ["Sparkling Spring Water", "6-Pack", "naturally carbonated"],
  ] as const);
  return { name: `${brand} ${item[0]} ${item[1]}`, spec: item[2] };
}

function sportsName(brand: string): { name: string; spec: string } {
  const item = pick([
    ["Yoga Mat", pick(["4mm", "6mm"]), "non-slip cushioned grip"],
    ["Adjustable Dumbbell", pick(["10kg", "15kg", "20kg"]), "quick-lock adjustable plates"],
    ["Insulated Water Bottle", "750ml", "24h cold insulation"],
    ["Resistance Band Set", "5-Piece", "five progressive resistances"],
    ["Trail Running Pack", "12L", "hydration-compatible 12L pack"],
    ["Skateboard Complete", pick(['31"', '32"']), "7-ply maple deck"],
  ] as const);
  return { name: `${brand} ${item[0]} ${item[1]}`, spec: item[2] };
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ---------------------------------------------------------------------------
// Category specs: name builder + price/weight behavior per leaf
// ---------------------------------------------------------------------------

interface CategorySpec {
  build: (brand: string) => { name: string; spec: string };
  priceRange: [number, number];
  unitNoun: string; // used in description
  weightRange?: [number, number]; // kg
  featureTags: string[];
}

const CATEGORY_SPECS: Record<string, CategorySpec> = {
  smartphones: {
    build: phoneName,
    priceRange: [299, 1_299],
    unitNoun: "smartphone",
    weightRange: [0.17, 0.24],
    featureTags: ["5g", "oled"],
  },
  laptops: {
    build: laptopName,
    priceRange: [699, 2_499],
    unitNoun: "laptop",
    weightRange: [1.1, 2.4],
    featureTags: ["ssd", "backlit"],
  },
  tablets: {
    build: tabletName,
    priceRange: [249, 899],
    unitNoun: "tablet",
    weightRange: [0.3, 0.7],
    featureTags: ["wifi", "retina"],
  },
  headphones: {
    build: headphoneName,
    priceRange: [59, 399],
    unitNoun: "headphones",
    weightRange: [0.2, 0.4],
    featureTags: ["bluetooth", "anc"],
  },
  "mobile-accessories": {
    build: mobileAccessoryName,
    priceRange: [9, 129],
    unitNoun: "accessory",
    weightRange: [0.05, 0.5],
    featureTags: ["fast-charge", "durable"],
  },
  "mens-shirts": {
    build: mensShirtName,
    priceRange: [24, 89],
    unitNoun: "shirt",
    weightRange: [0.2, 0.5],
    featureTags: ["cotton", "slim-fit"],
  },
  "mens-shoes": {
    build: (b) => shoeName(b, "Men's"),
    priceRange: [59, 189],
    unitNoun: "shoes",
    weightRange: [0.8, 1.5],
    featureTags: ["leather", "cushioned"],
  },
  "mens-watches": {
    build: (b) => watchName(b, "Men's"),
    priceRange: [89, 599],
    unitNoun: "watch",
    weightRange: [0.1, 0.3],
    featureTags: ["quartz", "sapphire"],
  },
  "womens-dresses": {
    build: womensDressName,
    priceRange: [39, 149],
    unitNoun: "dress",
    weightRange: [0.3, 0.8],
    featureTags: ["flowy", "occasion"],
  },
  "womens-shoes": {
    build: (b) => shoeName(b, "Women's"),
    priceRange: [49, 199],
    unitNoun: "shoes",
    weightRange: [0.6, 1.2],
    featureTags: ["leather", "comfort"],
  },
  "womens-watches": {
    build: (b) => watchName(b, "Women's"),
    priceRange: [79, 499],
    unitNoun: "watch",
    weightRange: [0.08, 0.25],
    featureTags: ["quartz", "slim"],
  },
  "womens-bags": {
    build: bagName,
    priceRange: [59, 329],
    unitNoun: "bag",
    weightRange: [0.4, 1.2],
    featureTags: ["leather", "crossbody"],
  },
  "womens-jewellery": {
    build: jewelleryName,
    priceRange: [29, 349],
    unitNoun: "jewellery",
    weightRange: [0.02, 0.15],
    featureTags: ["sterling", "gift"],
  },
  tops: {
    build: topsName,
    priceRange: [19, 69],
    unitNoun: "top",
    weightRange: [0.15, 0.4],
    featureTags: ["cotton", "everyday"],
  },
  sunglasses: {
    build: sunglassesName,
    priceRange: [39, 229],
    unitNoun: "sunglasses",
    weightRange: [0.03, 0.08],
    featureTags: ["uv400", "polarized"],
  },
  furniture: {
    build: furnitureName,
    priceRange: [149, 1_599],
    unitNoun: "furniture",
    featureTags: ["solid-wood", "modern"],
  },
  "home-decoration": {
    build: homeDecorationName,
    priceRange: [14, 249],
    unitNoun: "decor",
    weightRange: [0.2, 6],
    featureTags: ["handmade", "accent"],
  },
  "kitchen-accessories": {
    build: kitchenName,
    priceRange: [12, 299],
    unitNoun: "kitchen item",
    weightRange: [0.3, 4],
    featureTags: ["durable", "dishwasher-safe"],
  },
  beauty: {
    build: beautyName,
    priceRange: [9, 69],
    unitNoun: "beauty product",
    weightRange: [0.02, 0.2],
    featureTags: ["cruelty-free", "longwear"],
  },
  fragrances: {
    build: fragranceName,
    priceRange: [49, 189],
    unitNoun: "fragrance",
    weightRange: [0.2, 0.5],
    featureTags: ["eau-de-parfum", "signature"],
  },
  "skin-care": {
    build: skinCareName,
    priceRange: [15, 99],
    unitNoun: "skin care product",
    weightRange: [0.05, 0.3],
    featureTags: ["hydrating", "dermatologist-tested"],
  },
  groceries: {
    build: groceryName,
    priceRange: [1, 40],
    unitNoun: "grocery item",
    weightRange: [0.1, 2],
    featureTags: ["organic", "pantry"],
  },
  "sports-accessories": {
    build: sportsName,
    priceRange: [19, 229],
    unitNoun: "sports gear",
    weightRange: [0.3, 8],
    featureTags: ["training", "outdoor"],
  },
};

// ---------------------------------------------------------------------------
// Review rating helper — make integer review ratings average near `rating`.
// ---------------------------------------------------------------------------

function reviewRatingsFor(rating: number, count: number): number[] {
  if (count <= 0) return [];
  // Floor at 3 to match the positive-sentiment generated review pool.
  const base = Math.max(3, Math.round(rating));
  const clamp = (n: number) => Math.min(5, Math.max(3, n));
  // Start everyone at the rounded rating, then nudge some reviews down/up so
  // the arithmetic mean lands within ±0.25 of the product rating.
  const ratings = Array.from({ length: count }, () => clamp(base));
  const avg = () => ratings.reduce((s, r) => s + r, 0) / ratings.length;
  let guard = 0;
  while (avg() > rating + 0.25 && guard++ < 12) {
    const idx = int(0, ratings.length - 1);
    ratings[idx] = clamp(ratings[idx] - 1);
  }
  guard = 0;
  while (avg() < rating - 0.25 && guard++ < 12) {
    const idx = int(0, ratings.length - 1);
    ratings[idx] = clamp(ratings[idx] + 1);
  }
  return ratings;
}

// ---------------------------------------------------------------------------
// Public generator
// ---------------------------------------------------------------------------

/**
 * Fabricate `count` products for a leaf category. `group` supplies brand and
 * warranty pools; `leaf` supplies the naming/price taxonomy. The sequence of
 * PRNG draws is fixed since `rng` is module-level and seeded once.
 */
export function generateProducts(
  group: CategoryGroup,
  leaf: CategoryLeaf,
  count: number,
): GeneratedProductFabric[] {
  const spec = CATEGORY_SPECS[leaf.slug];
  if (!spec) {
    throw new Error(`No CATEGORY_SPECS entry for leaf "${leaf.slug}"`);
  }
  const brands = BRANDS[group.slug];
  const warranties = WARRANTY_OPTIONS[group.slug];

  const out: GeneratedProductFabric[] = [];
  for (let ix = 0; ix < count; ix++) {
    const brand = pick(brands);
    const { name, spec: specLine } = spec.build(brand);

    // Category-appropriate integer-dollar price, never below $1.
    const price = Math.max(1, Math.round(int(spec.priceRange[0], spec.priceRange[1])));

    const discountPercentage =
      next() < 0.4 ? pick(DISCOUNT_VALUES) : undefined;

    const rating = Math.round((3.2 + next() * 1.8) * 10) / 10;
    const stock = int(0, 120);
    const availabilityStatus = stock > 0 ? "In Stock" : "Out of Stock";

    const images = [1, 2, 3, 4].map(
      (n) => `https://picsum.photos/seed/flipzone-${leaf.slug}-${ix + 1}-${n}/800/800`,
    );

    const reviewCount = int(0, 4);
    const reviewRatings = reviewRatingsFor(rating, reviewCount);

    const weight = spec.weightRange
      ? Math.round((spec.weightRange[0] + next() * (spec.weightRange[1] - spec.weightRange[0])) * 100) / 100
      : undefined;

    const tagFeatures = pickTwo(spec.featureTags);

    out.push({
      title: name,
      description: `The ${name} from ${brand} delivers ${specLine}. A dependable ${spec.unitNoun} built for everyday use.`,
      price,
      discountPercentage,
      rating,
      stock,
      brand,
      sku: `${group.slug.slice(0, 3).toUpperCase()}-${leaf.slug.slice(0, 3).toUpperCase()}-${String(ix + 1).padStart(3, "0")}`,
      weight,
      tags: [group.slug, leaf.slug, brand.toLowerCase(), ...tagFeatures],
      images,
      thumbnail: images[0],
      warrantyInformation: pick(warranties),
      shippingInformation: pick(SHIPPING_OPTIONS),
      availabilityStatus,
      returnPolicy: pick(RETURN_OPTIONS),
      minimumOrderQuantity: int(1, 6),
      reviewRatings,
    });
  }
  return out;
}
