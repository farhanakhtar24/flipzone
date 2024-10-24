import React from "react";
import { priceFormatter } from "@/util/helper";
import { PlaceOrderButton } from "./CartButtons";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { IcartSummary } from "@/interfaces/actionInterface";

type Props = {
  cartData: IcartSummary;
};

const CartSummary = ({ cartData }: Props) => {
  const { finalPrice, totalDiscount, totalMRP, totalQuantity, cart } = cartData;

  const formattedPrices = {
    originaltotal: priceFormatter(totalMRP),
    discount: priceFormatter(totalDiscount),
    discountedTotal: priceFormatter(finalPrice),
  };

  return (
    <Card className="flex h-[63vh] w-[30%]">
      <CardContent className="flex h-full w-full flex-col p-0">
        <div className="flex border-b p-6">
          <p className="text-lg font-semibold text-black/80">PRICE DETAILS</p>
        </div>
        <div className="flex h-full flex-col gap-3 p-6">
          <div className="flex justify-between">
            <p>Price ({totalQuantity} items)</p>
            <p className="">{formattedPrices.originaltotal}</p>
          </div>
          <div className="flex justify-between">
            <p>Discount</p>
            <p className="text-green-600">{formattedPrices.discount}</p>
          </div>
          <div className="flex justify-between">
            <p>Delivery Charges</p>
            <p className="text-green-600">Free</p>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between text-lg font-semibold">
            <p>Total Amount</p>
            <p>{formattedPrices.discountedTotal}</p>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between">
            <p className="text-base font-semibold text-green-700">
              You will save {formattedPrices.discount} on this order.
            </p>
          </div>
        </div>
        <div className="flex w-full items-center justify-center p-6">
          <PlaceOrderButton cartId={cart.id} />
        </div>
      </CardContent>
    </Card>
  );
};

export default CartSummary;
