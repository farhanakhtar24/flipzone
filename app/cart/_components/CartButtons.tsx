"use client";
import { placeOrderFromCart } from "@/actions/cart.action";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";
import { PAGE_ROUTES } from "@/routes";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AiFillThunderbolt } from "react-icons/ai";
import { FiMinus } from "react-icons/fi";
import { GoPlus } from "react-icons/go";

type PlaceOrderButtonProps = {
  cartId: string;
};

type RemoveItemButtonProps = {
  quantity: number;
  handleQuantityUpdate: (quantity: number) => Promise<void>;
};

type QunatitySelectorInputsProps = {
  quantity: number;
  handleQuantityUpdate: (quantity: number) => void;
};

const PlaceOrderButton = ({ cartId }: PlaceOrderButtonProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePlaceOrder = async () => {
    const { message, error } = await placeOrderFromCart(cartId);

    if (error) {
      toast({
        title: message,
        description: error,
        variant: "destructive",
      });
    } else if (message) {
      toast({
        title: message,
        variant: "success",
      });

      router.push(PAGE_ROUTES.ORDERS);
    }
  };

  return (
    <Button
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        await handlePlaceOrder();
        setLoading(false);
      }}
      className="justify-centers flex h-12 w-full items-center bg-orange-500 text-lg hover:bg-orange-400"
    >
      {loading ? (
        <div className="h-5 w-5">
          <Spinner className="text-white" />
        </div>
      ) : (
        <>
          <AiFillThunderbolt className="mr-1 h-6 w-6" />
          Place Order
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
      className="justify-centers flex min-w-28 items-center bg-red-700 hover:bg-red-500"
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

const QunatitySelectorInputs = ({
  quantity,
  handleQuantityUpdate,
}: QunatitySelectorInputsProps) => {
  return (
    <div className="flex w-[20%] items-center justify-start gap-2 xl:w-[15%] xl:justify-center">
      <button
        className="flex aspect-square h-7 w-7 cursor-pointer items-center justify-center rounded-full border hover:bg-gray-100"
        onClick={() => handleQuantityUpdate(-1)}
      >
        <FiMinus />
      </button>
      <input
        type="number"
        value={quantity}
        className="w-12 rounded border text-center"
        readOnly
      />
      <button
        className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={() => handleQuantityUpdate(1)}
      >
        <GoPlus />
      </button>
    </div>
  );
};

export { PlaceOrderButton, RemoveItemButton, QunatitySelectorInputs };
