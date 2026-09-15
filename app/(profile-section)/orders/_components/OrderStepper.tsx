import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = ["Placed", "Paid", "Shipped", "Delivered"] as const;

const STATUS_INDEX: Record<string, number> = {
  PENDING: 0,
  PLACED: 0,
  PAID: 1,
  SHIPPED: 2,
  DELIVERED: 3,
};

type Props = {
  status: string;
};

/** Horizontal stepper showing order progress; cancelled orders get a single red chip. */
const OrderStepper = ({ status }: Props) => {
  if (status === "CANCELLED") {
    return (
      <span className="bg-destructive/10 text-destructive inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold">
        Cancelled
      </span>
    );
  }

  const currentIndex = STATUS_INDEX[status] ?? 0;

  return (
    <ol className="flex w-full items-center">
      {STEPS.map((step, i) => {
        const reached = i <= currentIndex;
        const active = i === currentIndex;
        return (
          <li key={step} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full border-2 text-[10px] font-bold",
                  reached
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground",
                  active && "ring-primary/30 ring-4",
                )}
              >
                {reached ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </span>
              <span
                className={cn(
                  "text-[11px] font-medium",
                  reached ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {step}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "mx-1 mb-5 h-0.5 flex-1 rounded",
                  i < currentIndex ? "bg-primary" : "bg-border",
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
};

export default OrderStepper;
