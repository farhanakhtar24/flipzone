import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { IOrderSummary } from "@/interfaces/actionInterface";
import { cn } from "@/lib/utils";
import { priceFormatter, timeFormatter } from "@/util/helper";
import CancelOrderButton from "./CancelOrderButton";
import OrderedItem from "./OrderedItem";

type Props = {
  order: IOrderSummary;
};

const STATUS_STYLES: Record<string, string> = {
  PENDING: "text-amber-600",
  PLACED: "text-blue-600",
  PAID: "text-green-600",
  SHIPPED: "text-indigo-600",
  DELIVERED: "text-green-700",
  CANCELLED: "text-destructive",
};

const OrderListItem = ({ order }: Props) => {
  const {
    orderId: id,
    placedAt: createdAt,
    total,
    status: orderStatus,
    items: orderItems,
  } = order;
  return (
    <div className="flex flex-col gap-3 border-b p-5">
      <div className="flex flex-col justify-between sm:flex-row">
        <div className="text-lg font-semibold">Order ID: #{id.slice(-8)}</div>
        <div className="flex gap-3">{timeFormatter(createdAt)}</div>
      </div>
      <div className="flex flex-col justify-between sm:flex-row">
        <div className="text-xl font-bold">Total: {priceFormatter(total)}</div>
        <div>Total Items: {orderItems.length}</div>
      </div>
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          Status:{" "}
          <span
            className={cn(
              "font-bold uppercase",
              STATUS_STYLES[orderStatus] ?? "text-muted-foreground",
            )}
          >
            {orderStatus}
          </span>
        </div>
        <CancelOrderButton orderId={id} status={orderStatus} />
      </div>
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1" className="border-0">
          <AccordionTrigger className="py-2">Products</AccordionTrigger>
          <AccordionContent className="grid w-full grid-cols-1 gap-5 p-0 lg:grid-cols-2">
            {orderItems.map((item) => {
              return <OrderedItem key={item.id} item={item} />;
            })}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default OrderListItem;
