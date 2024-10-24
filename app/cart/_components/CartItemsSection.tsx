import React from "react";
import { Card } from "@/components/ui/card";
import { IcartSummary } from "@/interfaces/actionInterface";
import CartItem from "./CartItem";

type Props = {
  cartData: IcartSummary;
};

const CartItemsSection = ({ cartData }: Props) => {
  const { cart } = cartData;
  const { items } = cart;
  console.log({
    items,
  });

  return (
    <Card className="flex h-[63vh] w-[70%] flex-col divide-y overflow-auto">
      {items.map((item, index) => {
        return <CartItem key={index} item={item} />;
      })}
    </Card>
  );
};

export default CartItemsSection;
