"use client";

import AddressForm from "@/components/Address/AddressForm";
import AddressSelector from "@/components/Address/AddressSelector";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { IcartSummary } from "@/interfaces/actionInterface";
import { priceFormatter } from "@/util/helper";
import { Address } from "@prisma/client";
import { useState } from "react";
import { CheckoutButton } from "./CartButtons";

type Props = {
  cartData: IcartSummary;
  addresses: Address[];
};

const CartSummary = ({ cartData, addresses }: Props) => {
  const { finalPrice, totalDiscount, totalMRP, totalQuantity } = cartData;
  const defaultAddress =
    addresses.find((a) => a.isDefault) ?? addresses[0] ?? null;
  const [selectedAddressId, setSelectedAddressId] = useState<
    string | undefined
  >(defaultAddress?.id);
  const [showForm, setShowForm] = useState(false);

  return (
    <Card className="flex w-full lg:h-fit lg:w-[30%] lg:min-w-[320px]">
      <CardContent className="flex h-full w-full flex-col p-0">
        <div className="flex border-b p-6">
          <p className="text-lg font-semibold">PRICE DETAILS</p>
        </div>
        <div className="flex flex-col gap-3 p-6">
          <div className="flex justify-between">
            <p>Price ({totalQuantity} items)</p>
            <p>{priceFormatter(totalMRP)}</p>
          </div>
          <div className="flex justify-between">
            <p>Discount</p>
            <p className="text-green-600">−{priceFormatter(totalDiscount)}</p>
          </div>
          <div className="flex justify-between">
            <p>Delivery Charges</p>
            <p className="text-green-600">Free</p>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between text-lg font-semibold">
            <p>Total Amount</p>
            <p>{priceFormatter(finalPrice)}</p>
          </div>
          <p className="text-sm font-semibold text-green-700">
            You will save {priceFormatter(totalDiscount)} on this order.
          </p>
        </div>
        <Separator />
        <div className="flex flex-col gap-4 p-6">
          <div className="flex items-center justify-between">
            <p className="text-lg font-semibold">Delivery address</p>
            <button
              type="button"
              onClick={() => setShowForm((v) => !v)}
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              {showForm ? "Hide form" : "+ Add new"}
            </button>
          </div>
          <AddressSelector
            addresses={addresses}
            selectedId={selectedAddressId}
            onSelect={setSelectedAddressId}
          />
          {showForm && (
            <AddressForm onDone={() => setShowForm(false)} />
          )}
          <CheckoutButton addressId={selectedAddressId} />
        </div>
      </CardContent>
    </Card>
  );
};

export default CartSummary;
