import Wrapper from "@/components/Wrapper/Wrapper";
import React from "react";
import ProductPage from "./_components/ProductPage";
import { getProductById } from "@/actions/product.action";
import { auth } from "@/auth";

type Props = {
  params: {
    id: string;
  };
};

const page = async ({ params }: Props) => {
  const session = await auth();
  const { id } = params;

  if (!session?.user?.id) {
    return (
      <Wrapper>
        <div>Product not found</div>
      </Wrapper>
    );
  }

  const { error, data: product } = await getProductById(id, session.user.id);

  if (error) {
    return (
      <Wrapper>
        <div>{error}</div>
      </Wrapper>
    );
  }

  if (!product) {
    return (
      <Wrapper>
        <div>Product not found</div>
      </Wrapper>
    );
  }

  console.log({ product });

  return (
    <Wrapper>
      <ProductPage product={product} />
    </Wrapper>
  );
};

export default page;
