"use client";

import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import { PAGE_ROUTES } from "@/routes";
import { Button } from "@/components/ui/button";
import { useCartDrawer } from "@/context/CartDrawerContext";

type Props = {
  cartCount: number;
  wishlistCount: number;
};

/**
 * Icon buttons with count badges for the navbar. Counts come from the server
 * (Navbar is a server component rendering this as a child); they refresh on
 * every navigation. Cart opens the mini-cart drawer; wishlist stays a link.
 */
const NavbarActions = ({ cartCount, wishlistCount }: Props) => {
  const { setOpen } = useCartDrawer();

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        asChild
        aria-label={`Wishlist, ${wishlistCount} items`}
      >
        <Link href={PAGE_ROUTES.WISHLIST}>
          <Heart className="h-5 w-5" />
          {wishlistCount > 0 && (
            <span className="bg-primary text-primary-foreground absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold">
              {wishlistCount > 99 ? "99+" : wishlistCount}
            </span>
          )}
        </Link>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        aria-label={`Cart, ${cartCount} items`}
        onClick={() => setOpen(true)}
      >
        <ShoppingCart className="h-5 w-5" />
        {cartCount > 0 && (
          <span className="bg-primary text-primary-foreground absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold">
            {cartCount > 99 ? "99+" : cartCount}
          </span>
        )}
      </Button>
    </>
  );
};

export default NavbarActions;
