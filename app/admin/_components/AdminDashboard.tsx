"use client";

import { AdminStats, updateOrderStatus } from "@/actions/admin.action";
import { useToast } from "@/hooks/use-toast";
import { priceFormatter, timeFormatter } from "@/util/helper";
import { OrderStatus } from "@prisma/client";
import { useState } from "react";

type Props = { stats: AdminStats };

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  PAID: ["SHIPPED", "CANCELLED"],
  PLACED: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
};

const AdminDashboard = ({ stats }: Props) => {
  const { toast } = useToast();
  const [pendingId, setPendingId] = useState<string | null>(null);

  const advance = async (orderId: string, status: OrderStatus) => {
    setPendingId(orderId);
    const { message, error } = await updateOrderStatus(orderId, status);
    setPendingId(null);
    toast({
      title: message,
      description: error,
      variant: error ? "destructive" : "success",
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Revenue (paid+)" value={priceFormatter(stats.totalRevenue)} />
        <Stat label="Orders" value={String(stats.orderCount)} />
        <Stat label="Users" value={String(stats.userCount)} />
        <Stat label="Products" value={String(stats.productCount)} />
      </div>

      <section>
        <h3 className="mb-3 text-lg font-semibold">Orders by status</h3>
        <div className="flex flex-wrap gap-2">
          {stats.ordersByStatus.map(({ status, count }) => (
            <span
              key={status}
              className="rounded-full border px-3 py-1 text-sm"
            >
              {status}: <strong>{count}</strong>
            </span>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-lg font-semibold">Recent orders</h3>
        <div className="flex flex-col divide-y rounded-lg border">
          {stats.recentOrders.map((order) => (
            <div
              key={order.id}
              className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="text-sm">
                <span className="font-medium">#{order.id.slice(-8)}</span>
                <span className="mx-2 text-muted-foreground">·</span>
                {priceFormatter(order.total)}
                <span className="mx-2 text-muted-foreground">·</span>
                {order.status}
                <span className="mx-2 text-muted-foreground">·</span>
                <span className="text-muted-foreground">
                  {order.userEmail ?? "—"} · {timeFormatter(order.createdAt)}
                </span>
              </div>
              <div className="flex gap-2">
                {(NEXT_STATUS[order.status] ?? []).map((next) => (
                  <button
                    key={next}
                    disabled={pendingId === order.id}
                    onClick={() => advance(order.id, next)}
                    className="rounded border px-2 py-1 text-xs hover:bg-muted disabled:opacity-50"
                  >
                    → {next}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {stats.recentOrders.length === 0 && (
            <p className="p-4 text-sm text-muted-foreground">No orders yet.</p>
          )}
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-lg font-semibold">Low stock (&lt;10)</h3>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {stats.lowStock.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded border p-3 text-sm"
            >
              <span className="line-clamp-1 pr-2">{p.title}</span>
              <span className="shrink-0 font-semibold text-destructive">
                {p.stock} left
              </span>
            </div>
          ))}
          {stats.lowStock.length === 0 && (
            <p className="text-sm text-muted-foreground">
              All products well stocked.
            </p>
          )}
        </div>
      </section>
    </div>
  );
};

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg border p-4">
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className="mt-1 text-2xl font-bold">{value}</p>
  </div>
);

export default AdminDashboard;
