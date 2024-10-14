import { Product } from "@prisma/client";
import React from "react";

type Props = {
  product: Product;
};

const SpecificationTable = ({ product }: Props) => {
  let {
    description,
    brand,
    availabilityStatus,
    dimensions,
    minimumOrderQuantity,
    returnPolicy,
    shippingInformation,
    stock,
    warrantyInformation,
    weight,
  } = product;

  // Set default values if they are null, undefined, or empty
  description = description ?? "";
  brand = brand ?? "";
  availabilityStatus = availabilityStatus ?? "";
  dimensions = dimensions ?? {
    depth: 0,
    height: 0,
    width: 0,
  };
  minimumOrderQuantity = minimumOrderQuantity ?? 0;
  returnPolicy = returnPolicy ?? "";
  shippingInformation = shippingInformation ?? "";
  stock = stock ?? 0;
  warrantyInformation = warrantyInformation ?? "";
  weight = weight ?? 0;

  const Specifications = [
    {
      label: "Description",
      value: description,
    },
    {
      label: "Brand",
      value: brand,
    },
    {
      label: "Availability Status",
      value: availabilityStatus,
    },
    {
      label: "Dimensions",
      value: `${dimensions.depth} x ${dimensions.height} x ${dimensions.width}`,
    },
    {
      label: "Minimum Order Quantity",
      value: `${minimumOrderQuantity} unit`,
    },
    {
      label: "Return Policy",
      value: returnPolicy,
    },
    {
      label: "Shipping Information",
      value: shippingInformation,
    },
    {
      label: "Stock",
      value: `${stock} ${stock > 1 ? "units" : "unit"}`,
    },
    {
      label: "Warranty Information",
      value: warrantyInformation,
    },
    {
      label: "Weight",
      value: weight + " gm",
    },
  ];

  return (
    <div className="mt-5 flex h-full w-full flex-col divide-y border">
      <div className="p-5 text-xl font-medium">Specifications</div>
      {Specifications.map(({ label, value }, index) => {
        return (
          value && (
            <div
              key={index}
              className="grid grid-cols-12 gap-5 p-5 text-xs font-medium"
            >
              <div className="col-span-3 text-gray-400">{label}</div>
              <div className="col-span-9 text-gray-900">{value}</div>
            </div>
          )
        );
      })}
    </div>
  );
};

export default SpecificationTable;
