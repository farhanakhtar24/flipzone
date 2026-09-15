import { getAllCategories } from "@/actions/category.action";
import Wrapper from "@/components/Wrapper/Wrapper";
import { Card, CardContent } from "@/components/ui/card";
import { PAGE_ROUTES } from "@/routes";
import { auth } from "@/auth";
import Link from "next/link";
import { ChevronRight, ShoppingBag } from "lucide-react";

export const dynamic = "force-dynamic";

const CategoriesPage = async () => {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <Wrapper>
        <div className="py-20 text-center text-muted-foreground">
          Please sign in to browse categories.
        </div>
      </Wrapper>
    );
  }

  const { data: categories, error } = await getAllCategories();

  if (error) {
    return (
      <Wrapper>
        <div className="py-20 text-center text-destructive">{error}</div>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <section className="py-10">
        <h1 className="mb-8 text-3xl font-bold tracking-tight">
          All Categories
        </h1>

        {!categories || categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
            <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            <p className="text-lg text-muted-foreground">
              No categories available yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`${PAGE_ROUTES.PRODUCTS}?category=${encodeURIComponent(
                  category.name,
                )}`}
              >
                <Card className="group h-full transition-all hover:shadow-md hover:ring-1 hover:ring-primary/20">
                  <CardContent className="flex items-center justify-between p-6">
                    <span className="text-lg font-medium capitalize">
                      {category.name}
                    </span>
                    <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </Wrapper>
  );
};

export default CategoriesPage;
