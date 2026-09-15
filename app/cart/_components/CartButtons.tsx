"use client";
import { createCheckoutSession } from "@/actions/checkout.action";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { AiFillThunderbolt } from "react-icons/ai";
import { FiMinus } from "react-icons/fi";
import { GoPlus } from "react-icons/go";

type RemoveItemButtonProps = {
  quantity: number;
  handleQuantityUpdate: (quantity: number) => Promise<void>;
};

type QuantitySelectorInputsProps = {
  stock: number;
  quantity: number;
  handleQuantityUpdate: (quantity: number) => void;
};

type CheckoutButtonProps = {
  addressId?: string;
};

const CheckoutButton = ({ addressId }: CheckoutButtonProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!addressId) {
      toast({
        title: "Choose a delivery address first.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { message, error, data } = await createCheckoutSession({
      addressId,
    });

    if (error || !data?.checkoutUrl) {
      toast({ title: message, description: error, variant: "destructive" });
      setLoading(false);
      return;
    }

    window.location.href = data.checkoutUrl;
  };

  return (
    <Button
      disabled={loading}
      onClick={handleCheckout}
      className="flex h-12 w-full items-center justify-center text-lg"
    >
      {loading ? (
        <div className="h-5 w-5">
          <Spinner className="text-primary-foreground" />
        </div>
      ) : (
        <>
          <AiFillThunderbolt className="mr-1 h-6 w-6" />
          Checkout
        </>
      )}
    </Button>
  );
};

const RemoveItemButton = ({
  handleQuantityUpdate,
  quantity,
}: RemoveItemButtonProps) => {
  const [loading, setLoading] = useState(false);

  return (
    <Button
      className="flex min-w-28 items-center justify-center bg-red-700 hover:bg-red-500"
      onClick={async () => {
        setLoading(true);
        await handleQuantityUpdate(-quantity);
        setLoading(false);
      }}
      disabled={loading}
    >
      {loading ? (
        <div className="h-5 w-5">
          <Spinner className="text-white" />
        </div>
      ) : (
        <>Remove</>
      )}
    </Button>
  );
};

const QuantitySelectorInputs = ({
  quantity,
  handleQuantityUpdate,
  stock,
}: QuantitySelectorInputsProps) => {
  return (
    <div className="flex w-[20%] items-center justify-start gap-2 xl:w-[15%] xl:justify-center">
      <button
        aria-label="Decrease quantity"
        className="flex aspect-square h-7 w-7 cursor-pointer items-center justify-center rounded-full border hover:bg-muted"
        onClick={() => handleQuantityUpdate(-1)}
      >
        <FiMinus />
      </button>
      <input
        type="number"
        value={quantity}
        aria-label="Quantity"
        className="w-12 rounded border bg-background text-center"
        readOnly
      />
      <button
        aria-label="Increase quantity"
        className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
        onClick={() => handleQuantityUpdate(1)}
        disabled={stock === quantity}
      >
        <GoPlus />
      </button>
    </div>
  );
};

export { CheckoutButton, RemoveItemButton, QuantitySelectorInputs };
