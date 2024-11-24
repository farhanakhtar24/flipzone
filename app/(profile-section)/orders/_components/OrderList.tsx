import { IOrderSummary } from "@/interfaces/actionInterface";
import React from "react";
import OrderListItem from "./OrderListItem";

type Props = {
  orders: IOrderSummary[];
};

const OrderList = ({ orders }: Props) => {
  return (
    <div className="flex h-full w-full flex-col overflow-auto">
      {orders.length === 0 && (
        <div className="flex h-full w-full items-center justify-center">
          No orders found
        </div>
      )}
      {orders.map((order) => {
        return <OrderListItem key={order.orderId} order={order} />;
      })}
    </div>
  );
};

export default OrderList;
