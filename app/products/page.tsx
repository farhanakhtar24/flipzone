import { getAllProducts } from "@/actions/product.action";
import Wrapper from "@/components/Wrapper/Wrapper";
import React from "react";
import ProductGrid from "./_components/ProductGrid";
import { auth } from "@/auth";
import Filters from "./_components/Filters";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const page = async ({ searchParams }: Props) => {
  const {
    search,
    priceRange,
    rating,
    discountPercentage,
    brand,
    category,
    sortBy,
  } = await searchParams;

  const filters = {
    search,
    priceRange,
    rating,
    discountPercentage,
    brand,
    category,
    sortBy,
  };

  const session = await auth();

  if (!session?.user?.id) {
    return (
      <Wrapper>
        <div>Product not found</div>
      </Wrapper>
    );
  }

  const { data, error, message } = await getAllProducts(session.user.id);

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

  console.log({ data });

  return (
    <section className="flex h-full w-full gap-5 px-5">
      <Filters filters={filters} />
      <ProductGrid products={data} />
    </section>
  );
};

export default page;
