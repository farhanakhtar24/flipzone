"use client";
import React from "react";
import { IOrderSummary } from "@/interfaces/actionInterface";
import { priceFormatter, timeFormatter } from "@/util/helper";
import CancelOrderButton from "./CancelOrderButton";
import OrderedItem from "./OrderedItem";
import OrderStepper from "./OrderStepper";
import { ChevronDown, Package } from "lucide-react";
import Image from "next/image";

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

  const [expanded, setExpanded] = React.useState(false);

  return (
    <div className="bg-card overflow-hidden rounded-xl border">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-lg">
            <Package className="h-4 w-4" />
          </span>
          <div>
            <p className="font-semibold">Order #{id.slice(-8)}</p>
            <p className="text-muted-foreground text-xs">
              {timeFormatter(createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-lg font-bold">{priceFormatter(total)}</p>
            <p className="text-muted-foreground text-xs">
              {orderItems.length}{" "}
              {orderItems.length === 1 ? "item" : "items"}
            </p>
          </div>
          <CancelOrderButton orderId={id} status={orderStatus} />
        </div>
      </div>

      {/* Stepper */}
      <div className="px-5 py-4">
        <OrderStepper status={orderStatus} />
      </div>

      {/* Thumbnail strip + expand */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="hover:bg-muted/50 flex w-full items-center justify-between border-t px-5 py-3 text-left transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {orderItems.slice(0, 4).map((item) =>
              item.thumbnail ? (
                <Image
                  key={item.id}
                  src={item.thumbnail}
                  alt={item.title}
                  width={36}
                  height={36}
                  className="border-background h-9 w-9 rounded-full border-2 object-cover"
                />
              ) : null,
            )}
          </div>
          <span className="text-muted-foreground text-sm">
            {expanded ? "Hide items" : "View items"}
          </span>
        </div>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {expanded && (
        <div className="grid grid-cols-1 gap-4 border-t bg-secondary/40 p-5 lg:grid-cols-2">
          {orderItems.map((item) => (
            <OrderedItem key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderListItem;
