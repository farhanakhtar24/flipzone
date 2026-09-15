import { getAllCategories } from "@/actions/category.action";
import Wrapper from "@/components/Wrapper/Wrapper";
import { PAGE_ROUTES } from "@/routes";
import { auth } from "@/auth";
import Link from "next/link";
import {
  ChevronRight,
  Cpu,
  Gem,
  ShoppingBasket,
  Shirt,
  Sofa,
  Sparkles,
} from "lucide-react";
import { CATEGORY_GROUPS, categoryLabel } from "@/constant/CategoryGroups";

export const dynamic = "force-dynamic";

const GROUP_ICONS: Record<string, typeof Cpu> = {
  electronics: Cpu,
  fashion: Shirt,
  "home-living": Sofa,
  "beauty-care": Sparkles,
  "groceries-sports": ShoppingBasket,
};

const CategoriesPage = async () => {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <Wrapper>
        <div className="text-muted-foreground py-20 text-center">
          Please sign in to browse categories.
        </div>
      </Wrapper>
    );
  }

  const { data: categories, error } = await getAllCategories();

  if (error) {
    return (
      <Wrapper>
        <div className="text-destructive py-20 text-center">{error}</div>
      </Wrapper>
    );
  }

  const counts = new Map((categories ?? []).map((c) => [c.name, c]));

  return (
    <Wrapper>
      <section className="py-10">
        <h1 className="mb-2 text-3xl font-bold tracking-tight">
          Shop by Category
        </h1>
        <p className="text-muted-foreground mb-10">
          Browse {categories?.length ?? 0} departments across the whole store.
        </p>

        <div className="space-y-12">
          {CATEGORY_GROUPS.map((group) => {
            const Icon = GROUP_ICONS[group.slug] ?? Gem;
            const leaves = group.leaves.filter((l) => counts.has(l.slug));
            if (leaves.length === 0) return null;
            return (
              <div key={group.slug}>
                <div className="mb-4 flex items-center gap-3">
                  <span className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-lg">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h2 className="text-xl font-semibold tracking-tight">
                    {group.label}
                  </h2>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {leaves.map((leaf) => (
                    <Link
                      key={leaf.slug}
                      href={`${PAGE_ROUTES.PRODUCTS}?category=${encodeURIComponent(
                        leaf.slug,
                      )}`}
                      className="group bg-card hover:ring-primary/30 flex items-center justify-between rounded-xl border p-5 transition-all hover:shadow-md hover:ring-1"
                    >
                      <span className="font-medium">
                        {categoryLabel(leaf.slug)}
                      </span>
                      <ChevronRight className="text-muted-foreground h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </Wrapper>
  );
};

export default CategoriesPage;
