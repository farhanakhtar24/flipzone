import Link from "next/link";
import { Category } from "@prisma/client";
import Wrapper from "@/components/Wrapper/Wrapper";
import ProductRail from "@/components/Product/ProductRail";
import { Skeleton } from "@/components/ui/skeleton";
import HeroCarousel, { HeroSlide } from "./HeroCarousel";
import RecentlyViewedRail from "@/components/Product/RecentlyViewedRail";
import { HomeRails } from "@/actions/product.action";
import { PAGE_ROUTES } from "@/routes";
import {
  CATEGORY_GROUPS,
} from "@/constant/CategoryGroups";
import {
  Cpu,
  Gem,
  ShoppingBasket,
  Shirt,
  Sofa,
  Sparkles,
  Truck,
  RotateCcw,
  ShieldCheck,
  BadgePercent,
} from "lucide-react";

const HERO_SLIDES: HeroSlide[] = [
  {
    eyebrow: "New season",
    title: "Tech that works as good as it looks",
    subtitle:
      "Laptops, smartphones and audio — up to 30% off top-rated gear this week.",
    ctaLabel: "Shop electronics",
    ctaHref: `${PAGE_ROUTES.PRODUCTS}?category=laptops,smartphones,headphones`,
    gradient: "from-indigo-600 via-indigo-500 to-violet-600",
    emoji: "💻",
  },
  {
    eyebrow: "Fresh drops",
    title: "Wardrobe staples, upgraded",
    subtitle: "New arrivals across fashion — dresses, sneakers, watches & more.",
    ctaLabel: "Shop fashion",
    ctaHref: `${PAGE_ROUTES.PRODUCTS}?category=womens-dresses,mens-shoes,tops`,
    gradient: "from-rose-500 via-pink-500 to-fuchsia-600",
    emoji: "👟",
  },
  {
    eyebrow: "Deal of the week",
    title: "Home refresh from $29",
    subtitle:
      "Furniture, decor and kitchen essentials with deep discounts while stock lasts.",
    ctaLabel: "Shop home & living",
    ctaHref: `${PAGE_ROUTES.PRODUCTS}?category=furniture,home-decoration`,
    gradient: "from-emerald-600 via-teal-600 to-cyan-700",
    emoji: "🛋️",
  },
];

const GROUP_ICONS: Record<string, typeof Cpu> = {
  electronics: Cpu,
  fashion: Shirt,
  "home-living": Sofa,
  "beauty-care": Sparkles,
  "groceries-sports": ShoppingBasket,
};

const VALUE_PROPS = [
  { icon: Truck, label: "Free shipping over $50" },
  { icon: RotateCcw, label: "30-day easy returns" },
  { icon: ShieldCheck, label: "Secure checkout" },
  { icon: BadgePercent, label: "New deals daily" },
];

const RailSkeleton = () => (
  <div className="flex gap-4 overflow-hidden">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="w-[220px] shrink-0 space-y-3 sm:w-[240px]">
        <Skeleton className="aspect-[4/5] w-full rounded-xl" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    ))}
  </div>
);

type Props = {
  categories: Category[];
  rails: HomeRails | null;
  cartIds: string[];
  wishlistIds: string[];
};

const HomePage = ({ categories, rails, cartIds, wishlistIds }: Props) => {
  const categoryCounts = new Map(categories.map((c) => [c.name, c]));

  return (
    <Wrapper>
      <div className="space-y-14 py-8">
        {/* Hero carousel */}
        <HeroCarousel slides={HERO_SLIDES} />

        {/* Value props */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {VALUE_PROPS.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="bg-card flex items-center gap-3 rounded-xl border p-4 text-sm"
            >
              <Icon className="text-primary h-5 w-5 shrink-0" />
              <span className="font-medium">{label}</span>
            </div>
          ))}
        </div>

        {/* Category tiles, grouped */}
        <section>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
              Shop by category
            </h2>
            <Link
              href="/categories"
              className="text-primary text-sm font-medium hover:underline"
            >
              All categories
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {CATEGORY_GROUPS.map((group) => {
              const Icon = GROUP_ICONS[group.slug] ?? Gem;
              const count = group.leaves.filter((l) =>
                categoryCounts.has(l.slug),
              ).length;
              if (count === 0) return null;
              return (
                <Link
                  key={group.slug}
                  href={`${PAGE_ROUTES.PRODUCTS}?category=${group.leaves
                    .map((l) => l.slug)
                    .join(",")}`}
                  className="group bg-card hover:ring-primary/30 flex flex-col gap-3 rounded-xl border p-5 transition-all hover:shadow-md hover:ring-1"
                >
                  <span className="bg-primary/10 text-primary group-hover:bg-primary flex h-11 w-11 items-center justify-center rounded-lg transition-colors group-hover:text-primary-foreground">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-semibold">{group.label}</p>
                    <p className="text-muted-foreground text-xs">
                      {count} departments
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Deal strip */}
        {rails ? (
          <section className="bg-primary/5 ring-primary/10 rounded-2xl p-6 ring-1">
            <ProductRail
              title="Top deals — up to 50% off"
              products={rails.deals}
              viewAllHref={`${PAGE_ROUTES.PRODUCTS}?discountPercentage=25&sortBy=discountPercentage:desc`}
              cartIds={cartIds}
              wishlistIds={wishlistIds}
            />
          </section>
        ) : (
          <RailSkeleton />
        )}

        {/* Bestsellers */}
        {rails ? (
          <ProductRail
            title="Bestsellers"
            products={rails.bestsellers}
            viewAllHref={`${PAGE_ROUTES.PRODUCTS}?sortBy=rating:desc`}
            cartIds={cartIds}
            wishlistIds={wishlistIds}
          />
        ) : (
          <RailSkeleton />
        )}

        {/* Recently viewed (renders only when the guest has history) */}
        <RecentlyViewedRail cartIds={cartIds} wishlistIds={wishlistIds} />

        {/* Personalized recommendations */}
        {rails ? (
          <ProductRail
            title="Picked for you"
            products={rails.recommended}
            viewAllHref={PAGE_ROUTES.PRODUCTS}
            cartIds={cartIds}
            wishlistIds={wishlistIds}
          />
        ) : (
          <RailSkeleton />
        )}

        {/* New arrivals */}
        {rails ? (
          <ProductRail
            title="New arrivals"
            products={rails.newArrivals}
            viewAllHref={`${PAGE_ROUTES.PRODUCTS}?sortBy=createdAt:desc`}
            cartIds={cartIds}
            wishlistIds={wishlistIds}
          />
        ) : (
          <RailSkeleton />
        )}
      </div>
    </Wrapper>
  );
};

export default HomePage;
