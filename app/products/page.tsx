import { getAllProducts } from "@/actions/product.action";
import Wrapper from "@/components/Wrapper/Wrapper";
import React from "react";
import ProductGrid from "./_components/ProductGrid";

const page = async () => {
  const { data, error, message } = await getAllProducts();

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
        <div>No products found</div>
      </Wrapper>
    );
  }

  if (message) {
    console.log("message :", message);
  }

  return (
    <Wrapper>
      <ProductGrid products={data} />
    </Wrapper>
  );
};

export default page;
