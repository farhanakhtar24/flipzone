"use client";
import React from "react";
import { Button } from "../ui/button";
import { useSession } from "next-auth/react";
import Spinner from "../ui/spinner";
import { addToCart } from "@/actions/product.action";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { wishlistItem } from "@/actions/wishlist.action";
import { FiHeart } from "react-icons/fi";

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

type WishlistingProps = {
  productId: string;
  isWishlisted: boolean;
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
          title: message,
          description: error,
          variant: "destructive",
        });
      }

      if (message) {
        toast({
          title: message,
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

const WishListButton = ({ productId, isWishlisted }: WishlistingProps) => {
  const { data: session } = useSession();
  const userId = session?.user.id;
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (userId && productId) {
      const { error, message } = await wishlistItem({
        productId,
        userId,
        wishListedItem: !isWishlisted,
      });

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
      }
    }
  };

  return (
    <div
      className="h-full w-full cursor-pointer rounded-full border bg-white p-2 transition-all hover:bg-slate-100 active:scale-75"
      onClick={handleSubmit}
    >
      <FiHeart
        className={`h-full w-full ${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-500"}`}
      />
    </div>
  );
};

export { BuyNowButton, AddToCartButton, GoToCartButton, WishListButton };
