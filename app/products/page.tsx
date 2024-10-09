import { getAllProducts } from "@/actions/product.action";
import Wrapper from "@/components/Wrapper/Wrapper";
import React from "react";

const page = async () => {
  const products = await getAllProducts();
  return (
    <Wrapper>
      <div className="flex w-full flex-col flex-wrap">{}</div>
    </Wrapper>
  );
};

export default page;
