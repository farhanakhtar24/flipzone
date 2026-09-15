"use client";

import { cancelOrder } from "@/actions/order.action";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

type Props = {
  orderId: string;
  status: string;
};

const CANCELLABLE = new Set(["PENDING", "PAID", "PLACED"]);

const CancelOrderButton = ({ orderId, status }: Props) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  if (!CANCELLABLE.has(status)) return null;

  const handleCancel = async () => {
    setLoading(true);
    const { message, error } = await cancelOrder(orderId);
    setLoading(false);

    toast({
      title: message,
      description: error,
      variant: error ? "destructive" : "success",
    });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={loading}
      onClick={handleCancel}
      className="text-destructive"
    >
      {loading ? (
        <span className="inline-flex h-4 w-4">
          <Spinner />
        </span>
      ) : (
        "Cancel order"
      )}
    </Button>
  );
};

export default CancelOrderButton;
