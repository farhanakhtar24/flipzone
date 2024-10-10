import { Product } from "@prisma/client";
import React from "react";

type Props = {
  product: Product;
};

const PhotoSection = ({ product }: Props) => {
  return <div>PhotoSection</div>;
};

export default PhotoSection;
