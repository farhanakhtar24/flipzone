"use client";
import { Product } from "@prisma/client";
import clsx from "clsx";
import Image from "next/image";
import React, { useState } from "react";

type Props = {
  product: Product;
};

const PhotoSection = ({ product }: Props) => {
  const { images } = product;
  const [currentImage, setCurrentImage] = useState(images[0]);
  return (
    <div className="flex w-full">
      <div className="flex h-full max-h-[400px] flex-shrink-0 flex-col overflow-auto contain-content">
        {images.map((image, index) => {
          return (
            <Image
              key={index}
              src={image}
              alt="product image"
              width={256}
              height={256}
              className={clsx(
                `h-16 w-16 cursor-pointer p-1`,
                currentImage === image
                  ? "border-2 border-blue-500"
                  : "border border-r-0",
              )}
              onClick={() => setCurrentImage(image)}
              onMouseEnter={() => setCurrentImage(image)}
            />
          );
        })}
      </div>
      <div className="flex flex-grow border">
        <Image
          src={currentImage}
          alt="product image"
          width={999}
          height={999}
          className="h-[400px] w-[400px] p-5"
        />
      </div>
    </div>
  );
};

export default PhotoSection;
