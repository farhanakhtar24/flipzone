import { getAllProducts } from "@/actions/product.action";
import Wrapper from "@/components/Wrapper/Wrapper";
import React from "react";
import ProductGrid from "./_components/ProductGrid";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const page = async ({ searchParams }: Props) => {
  const { search } = await searchParams;
  console.log("search :", search);

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

  // console.log({ data });

  return (
    <Wrapper>
      <ProductGrid products={data} />
    </Wrapper>
  );
};

export default page;
