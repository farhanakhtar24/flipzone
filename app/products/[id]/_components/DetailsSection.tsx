import { Product } from "@prisma/client";
import React from "react";

type Props = {
  product: Product;
};

const DetailsSection = ({ product }: Props) => {
  return <div>DetailsSection</div>;
};

export default DetailsSection;
