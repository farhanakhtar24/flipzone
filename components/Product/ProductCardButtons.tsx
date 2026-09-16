"use client";
import React from "react";
import { Button } from "../ui/button";
import Spinner from "../ui/spinner";
import { addToCart } from "@/actions/product.action";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "nextjs-toploader/app";
import { wishlistItem } from "@/actions/wishlist.action";
import { FiHeart } from "react-icons/fi";
import { PAGE_ROUTES } from "@/routes";
import { useCartDrawer } from "@/context/CartDrawerContext";

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

  const handleSubmit = async () => {
    if (productId) {
      setIsBuyingNow(true);
      await addToCart({ productId });
      router.push(PAGE_ROUTES.CART);
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
  const { setOpen } = useCartDrawer();

  const handleSubmit = async () => {
    if (productId) {
      setIsAddingToCart(true);

      const { error, message } = await addToCart({
        productId,
      });

      if (error) {
        toast({
          title: message,
          description: error,
          variant: "destructive",
        });
        setIsAddingToCart(false);
        return;
      }

      if (message) {
        toast({
          title: message,
          variant: "success",
        });
      }

      // Open the mini-cart so the user sees what just landed in their bag.
      setOpen(true);
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
        router.push(PAGE_ROUTES.CART);
      }}
    >
      Go to Cart
    </Button>
  );
};

const WishListButton = ({ productId, isWishlisted }: WishlistingProps) => {
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (productId) {
      const { error, message } = await wishlistItem({
        productId,
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
    <button
      type="button"
      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={isWishlisted}
      className="h-full w-full cursor-pointer rounded-full border bg-background p-2 transition-all hover:bg-muted active:scale-75"
      onClick={handleSubmit}
    >
      <FiHeart
        className={`h-full w-full ${isWishlisted ? "fill-red-500 text-red-500" : "text-muted-foreground"}`}
      />
    </button>
  );
};

export { BuyNowButton, AddToCartButton, GoToCartButton, WishListButton };
