import React from "react";
import { getUserAddresses } from "@/actions/address.action";
import { getUserCart } from "@/actions/cart.action";
import { auth } from "@/auth";
import Wrapper from "@/components/Wrapper/Wrapper";
import CartSummary from "./_components/CartSummary";
import CartItemsSection from "./_components/CartItemsSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

const page = async () => {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <Wrapper>
        <div>Cart not found</div>
      </Wrapper>
    );
  }

  const [{ data: cartData, message, error }, { data: addresses }] =
    await Promise.all([getUserCart(), getUserAddresses()]);

  if (error) {
    return (
      <Wrapper>
        <div>{error}</div>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <div className="flex h-full w-full flex-col gap-5">
        <Card className="flex w-full">
          <CardHeader>
            <CardTitle className="text-2xl">Cart</CardTitle>
          </CardHeader>
        </Card>
        {cartData ? (
          <div className="flex w-full flex-col gap-5 lg:flex-row">
            <CartItemsSection cartData={cartData} />
            <CartSummary cartData={cartData} addresses={addresses ?? []} />
          </div>
        ) : (
          <Card>
            <CardContent className="p-6">{message}</CardContent>
          </Card>
        )}
      </div>
    </Wrapper>
  );
};

export default page;
