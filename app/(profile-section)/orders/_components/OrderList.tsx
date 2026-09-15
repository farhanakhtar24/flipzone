import { IOrderSummary } from "@/interfaces/actionInterface";
import Link from "next/link";
import React from "react";
import OrderListItem from "./OrderListItem";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";
import { PAGE_ROUTES } from "@/routes";

type Props = {
  orders: IOrderSummary[];
};

const OrderList = ({ orders }: Props) => {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <span className="bg-primary/10 text-primary flex h-16 w-16 items-center justify-center rounded-full">
          <ShoppingBag className="h-8 w-8" />
        </span>
        <div>
          <p className="text-lg font-semibold">No orders yet</p>
          <p className="text-muted-foreground mt-1 text-sm">
            When you place an order, it&rsquo;ll show up here.
          </p>
        </div>
        <Button asChild>
          <Link href={PAGE_ROUTES.PRODUCTS}>Start shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-5">
      {orders.map((order) => (
        <OrderListItem key={order.orderId} order={order} />
      ))}
    </div>
  );
};

export default OrderList;
