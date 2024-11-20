import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { IOrderSummary } from "@/interfaces/actionInterface";
import { priceFormatter, timeFormatter } from "@/util/helper";
import OrderedItem from "./OrderedItem";

type Props = {
  order: IOrderSummary;
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
    <div key={id} className="flex flex-col gap-3 border-b border-gray-300 p-5">
      <div className="flex flex-col justify-between sm:flex-row">
        <div className="text-lg font-semibold text-gray-700">
          Order ID: #{id}
        </div>
        <div className="flex gap-3">{timeFormatter(createdAt)}</div>
      </div>
      <div className="flex flex-col justify-between sm:flex-row">
        <div className="text-xl font-bold">Total: {priceFormatter(total)}</div>
        <div>Total Items: {orderItems.length}</div>
      </div>
      <div className="flex flex-col justify-between sm:flex-row">
        <div>
          Status:{" "}
          <span className="font-bold uppercase text-green-600">
            {orderStatus}
          </span>
        </div>
      </div>
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1" className="border-0">
          <AccordionTrigger className="py-2">Products</AccordionTrigger>
          <AccordionContent className="grid w-full grid-cols-1 gap-5 p-0 lg:grid-cols-2">
            {orderItems.map((item, idx) => {
              return <OrderedItem key={idx} item={item} />;
            })}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default OrderListItem;
