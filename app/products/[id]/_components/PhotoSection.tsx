"use client";
import { IproductWithCartStatus } from "@/interfaces/actionInterface";
import { cn } from "@/lib/utils";
import Image from "next/image";
import React, { useState } from "react";

type Props = {
  product: IproductWithCartStatus;
};

/** Left-column gallery: thumbnail rail + main image. Buy actions live in the sticky BuyPanel. */
const PhotoSection = ({ product }: Props) => {
  const { images, title } = product;
  const [currentImage, setCurrentImage] = useState(images[0]);

  return (
    <div className="flex flex-col-reverse gap-4 md:flex-row">
      {/* Thumbnail rail */}
      <div className="flex gap-3 overflow-x-auto md:max-h-[480px] md:flex-col md:overflow-y-auto">
        {images.map((image, index) => (
          <button
            key={index}
            type="button"
            aria-label={`View image ${index + 1}`}
            onClick={() => setCurrentImage(image)}
            onMouseEnter={() => setCurrentImage(image)}
            className={cn(
              "bg-secondary relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors",
              currentImage === image ? "border-primary" : "border-transparent",
            )}
          >
            <Image
              src={image}
              alt={`${title} thumbnail ${index + 1}`}
              fill
              sizes="64px"
              className="object-cover"
            />
          </button>
        ))}
      </div>
      {/* Main image */}
      <div className="bg-secondary relative aspect-square w-full overflow-hidden rounded-xl">
        <Image
          src={currentImage}
          alt={title}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 40vw"
          className="object-cover"
        />
      </div>
    </div>
  );
};

export default PhotoSection;
