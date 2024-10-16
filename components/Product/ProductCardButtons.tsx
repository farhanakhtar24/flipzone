"use client";
import React from "react";
import { Button } from "../ui/button";
import { useSession } from "next-auth/react";
import Spinner from "../ui/spinner";
import { addToCart } from "@/actions/product.action";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

type BuyNowButtonProps = {
  productId: string;
  isBuyingNow: boolean;
  setIsBuyingNow: React.Dispatch<React.SetStateAction<boolean>>;
};

type AddingToCartProps = {
  productId: string;
  isAddingToCart: boolean;
  setIsAddingToCart: React.Dispatch<React.SetStateAction<boolean>>;
};

const BuyNowButton = ({
  productId,
  isBuyingNow,
  setIsBuyingNow,
}: BuyNowButtonProps) => {
  const router = useRouter();
  const { data: session } = useSession();
  const userId = session?.user.id;

  const handleSubmit = async () => {
    if (userId && productId) {
      setIsBuyingNow(true);
      await addToCart({ userId, productId });
      router.push(`/cart`);
      setIsBuyingNow(false);
    }
  };

  return (
    <Button
      className="w-full"
      size="lg"
      disabled={isBuyingNow}
      onClick={handleSubmit}
    >
      {isBuyingNow ? (
        <div className="h-5 w-5">
          <Spinner className="text-white" />
        </div>
      ) : (
        <>Buy Now</>
      )}
    </Button>
  );
};

const AddToCartButton = ({
  productId,
  isAddingToCart,
  setIsAddingToCart,
}: AddingToCartProps) => {
  const { toast } = useToast();
  const { data: session } = useSession();

  const userId = session?.user.id;

  const handleSubmit = async () => {
    if (userId && productId) {
      setIsAddingToCart(true);

      const { error, message } = await addToCart({
        userId,
        productId,
      });

      // raise a toast here
      if (error) {
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        });
      } else if (message) {
        toast({
          title: "Success",
          description: message,
          variant: "success",
        });
      }

      setIsAddingToCart(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="lg"
      className="w-full"
      disabled={isAddingToCart}
      onClick={handleSubmit}
    >
      {isAddingToCart ? (
        <div className="h-5 w-5">
          <Spinner className="text-slate-800" />
        </div>
      ) : (
        <>Add to Cart</>
      )}
    </Button>
  );
};

const GoToCartButton = () => {
  const router = useRouter();
  return (
    <Button
      variant="outline"
      size="lg"
      className="w-full"
      onClick={() => {
        router.push("/cart");
      }}
    >
      Go to Cart
    </Button>
  );
};

export { BuyNowButton, AddToCartButton, GoToCartButton };
