import React from "react";
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

  const { data: cartData, message, error } = await getUserCart(session.user.id);

  if (error) {
    return (
      <Wrapper>
        <div>{error}</div>
      </Wrapper>
    );
  }

  // if (!cartData) {
  //   return (
  //     <Wrapper>
  //       <Card>
  //         <CardContent className="p-6">{message}</CardContent>
  //       </Card>
  //     </Wrapper>
  //   );
  // }

  if (message) {
    console.log("message :", message);
  }

  console.log({ cartData });

  return (
    <Wrapper>
      <div className="flex h-full w-full flex-col gap-5">
        <Card className="flex h-full w-full">
          <CardHeader>
            <CardTitle className="text-2xl">Cart</CardTitle>
          </CardHeader>
        </Card>
        {cartData ? (
          <div className="flex h-full w-full gap-5">
            <CartItemsSection cartData={cartData} />
            <CartSummary cartData={cartData} />
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
