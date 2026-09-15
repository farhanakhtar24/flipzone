import { getAllCategories } from "@/actions/category.action";
import { getAllProducts } from "@/actions/product.action";
import Wrapper from "@/components/Wrapper/Wrapper";
import { Card, CardContent } from "@/components/ui/card";
import { priceFormatter } from "@/util/helper";
import Link from "next/link";
import { PAGE_ROUTES } from "@/routes";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

const page = async () => {
  const [productsResult, categoriesResult] = await Promise.all([
    getAllProducts({ sortBy: "rating:desc" }),
    getAllCategories(),
  ]);

  const products = productsResult?.data ?? [];
  const categories = categoriesResult?.data ?? [];

  return (
    <Wrapper>
      {/* Hero Section */}
      <section className="flex flex-col items-center gap-6 py-20 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Welcome to <span className="text-primary">Flipzone</span>
        </h1>
        <p className="max-w-[600px] text-lg text-muted-foreground">
          Discover top-rated products across every category. Compare prices,
          read reviews, and shop smarter.
        </p>
        <Link
          href={PAGE_ROUTES.PRODUCTS}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-lg font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Browse Products
          <ArrowRight className="h-5 w-5" />
        </Link>
      </section>

      {/* Category Pills */}
      {categories.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-2xl font-semibold">Shop by Category</h2>
          <div className="flex flex-wrap gap-3">
            {categories.slice(0, 12).map((category) => (
              <Link
                key={category.id}
                href={`${PAGE_ROUTES.PRODUCTS}?category=${encodeURIComponent(
                  category.name,
                )}`}
                className="rounded-full border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-primary"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products — uses generic card instead of ProductsCard to
          avoid needing useSession in a server component */}
      {products.length > 0 && (
        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Featured Products</h2>
            <Link
              href={PAGE_ROUTES.PRODUCTS}
              className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.slice(0, 8).map((product) => (
              <Link
                key={product.id}
                href={`${PAGE_ROUTES.PRODUCTS}/${product.id}`}
              >
                <Card className="h-full overflow-hidden transition-shadow hover:shadow-lg">
                  <CardContent className="p-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.thumbnail}
                      alt={product.title}
                      className="aspect-square w-full object-cover"
                    />
                    <div className="p-4">
                      <h3 className="line-clamp-1 text-base font-semibold">
                        {product.title}
                      </h3>
                      <p className="mt-1 text-lg font-bold text-primary">
                        {priceFormatter(product.price)}
                      </p>
                      {product.discountPercentage && (
                        <p className="text-sm text-green-600">
                          {Math.round(product.discountPercentage)}% off
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </Wrapper>
  );
};

export default page;
