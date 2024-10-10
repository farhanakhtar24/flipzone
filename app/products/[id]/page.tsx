import Wrapper from "@/components/Wrapper/Wrapper";
import React from "react";
import ProductPage from "./_components/ProductPage";
import { getProductById } from "@/actions/product.action";

type Props = {
  params: {
    id: string;
  };
};

const page = async ({ params }: Props) => {
  const { id } = params;

  const { error, data: product } = await getProductById(id);

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

  return (
    <Wrapper>
      <ProductPage product={product} />
    </Wrapper>
  );
};

export default page;
