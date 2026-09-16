import { getAllProducts } from "@/actions/product.action";
import { getCartAndWishlistIds } from "@/actions/user-status.action";
import Wrapper from "@/components/Wrapper/Wrapper";
import React from "react";
import ProductGrid from "./_components/ProductGrid";
import { auth } from "@/auth";
import FilterSection from "./_components/Filters/FilterSection";
import TaggedFilters from "./_components/Filters/TaggedFilters";
import SortBy from "./_components/Filters/SortBy";
import Pagination from "@/components/Pagination/Pagination";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { categoryLabel } from "@/constant/CategoryGroups";
import Link from "next/link";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 24;

type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

const page = async ({ searchParams }: Props) => {
  const pageParam = Number(searchParams.page);
  const currentPage =
    Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1;

  const filters = {
    search: searchParams.search as string | undefined,
    priceRange: searchParams.priceRange
      ? (searchParams.priceRange
          .toString()
          .replace(/[\[\]]/g, "")
          .split(",")
          .map(Number) as [number, number])
      : undefined,
    rating: searchParams.rating ? Number(searchParams.rating) : undefined,
    discountPercentage: searchParams.discountPercentage
      ? Number(searchParams.discountPercentage)
      : undefined,
    brand: searchParams.brand as string | undefined,
    category: searchParams.category as string | undefined,
    sortBy: searchParams.sortBy as string | undefined,
    inStock: searchParams.inStock as string | undefined,
    page: currentPage,
    pageSize: PAGE_SIZE,
  };

  const session = await auth();

  if (!session?.user?.id) {
    return (
      <Wrapper>
        <div className="text-muted-foreground py-20 text-center">
          Please sign in to browse products.
        </div>
      </Wrapper>
    );
  }

  const [{ data, error, message, totalCount }, statusRes] = await Promise.all([
    getAllProducts(filters),
    getCartAndWishlistIds(),
  ]);

  if (error || !data) {
    return (
      <Wrapper>
        <div className="text-destructive py-20 text-center">
          {error ?? message}
        </div>
      </Wrapper>
    );
  }

  const cartIds = statusRes.data?.cartIds ?? [];
  const wishlistIds = statusRes.data?.wishlistIds ?? [];

  const total = totalCount ?? data.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const singleCategory =
    filters.category && !filters.category.includes(",")
      ? filters.category
      : undefined;

  return (
    <Wrapper>
      <div className="py-6">
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {singleCategory ? (
                <BreadcrumbLink asChild>
                  <Link href="/products">Products</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>Products</BreadcrumbPage>
              )}
            </BreadcrumbItem>
            {singleCategory && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>
                    {categoryLabel(singleCategory)}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-start gap-6">
          <FilterSection />

          <div className="min-w-0 flex-1">
            {/* Toolbar */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-muted-foreground text-sm">
                <span className="font-semibold text-foreground">{total}</span>{" "}
                products
                {singleCategory && (
                  <>
                    {" "}
                    in{" "}
                    <span className="font-medium text-foreground">
                      {categoryLabel(singleCategory)}
                    </span>
                  </>
                )}
              </p>
              <SortBy />
            </div>

            <TaggedFilters />

            <div className="mt-4">
              <ProductGrid
                products={data}
                cartIds={cartIds}
                wishlistIds={wishlistIds}
              />
            </div>

            <Pagination currentPage={currentPage} totalPages={totalPages} />
          </div>
        </div>
      </div>
    </Wrapper>
  );
};

export default page;
