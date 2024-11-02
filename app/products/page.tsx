import { getAllProducts } from "@/actions/product.action";
import Wrapper from "@/components/Wrapper/Wrapper";
import React from "react";
import ProductGrid from "./_components/ProductGrid";
import { auth } from "@/auth";
import FilterSection from "./_components/Filters/FilterSection";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

const page = async ({ searchParams }: Props) => {
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
  };

  console.log("filters :", filters);

  const session = await auth();

  if (!session?.user?.id) {
    return (
      <Wrapper>
        <div>Product not found</div>
      </Wrapper>
    );
  }

  const { data, error, message } = await getAllProducts(
    session.user.id,
    filters,
  );

  if (error) {
    return (
      <Wrapper>
        <div>{error}</div>
      </Wrapper>
    );
  }

  if (!data) {
    return (
      <Wrapper>
        <div>{message}</div>
      </Wrapper>
    );
  }

  if (message) {
    console.log("message :", message);
  }

  return (
    <section className="flex h-full w-full gap-5 px-5">
      <FilterSection />
      <ProductGrid products={data} />
    </section>
  );
};

export default page;
