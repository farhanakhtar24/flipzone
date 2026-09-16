"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "nextjs-toploader/app";
import { ShoppingCart, Trash2 } from "lucide-react";

import { getUserCart } from "@/actions/cart.action";
import { updateCartItemQuantity } from "@/actions/cart.action";
import { useCartDrawer } from "@/context/CartDrawerContext";
import { IcartSummary } from "@/interfaces/actionInterface";
import { getCartTotals } from "@/lib/pricing";
import { priceFormatter } from "@/util/helper";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

/**
 * Slide-from-the-right mini cart. Opens after every Add-to-Cart and from the
 * navbar cart icon. Fetches on each open so quantities/totals are always
 * fresh, and reuses the shared `getCartTotals` so numbers match the cart page.
 */
const CartDrawer = () => {
  const { open, setOpen } = useCartDrawer();
  const { toast } = useToast();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState<IcartSummary | null>(null);
  const [pendingItemId, setPendingItemId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    getUserCart()
      .then((res) => {
        if (!cancelled) setCart(res.success ? (res.data ?? null) : null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  const items = cart?.cart.items ?? [];
  const totals = getCartTotals(items);

  const changeQuantity = async (cartItemId: string, delta: number) => {
    setPendingItemId(cartItemId);
    const res = await updateCartItemQuantity({ cartItemId, quantityChange: delta });
    if (!res.success) {
      toast({ title: res.message, variant: "destructive" });
    }
    const fresh = await getUserCart();
    setCart(fresh.success ? (fresh.data ?? null) : null);
    setPendingItemId(null);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b px-5 py-4">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Cart{totals.itemCount > 0 ? ` (${totals.itemCount})` : ""}
          </SheetTitle>
        </SheetHeader>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-20 w-16 rounded-md" />
                  <div className="flex-1 space-y-2 py-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <ShoppingCart className="text-muted-foreground/40 h-12 w-12" />
              <p className="font-medium">Your cart is empty</p>
              <p className="text-muted-foreground text-sm">
                Add items and they&apos;ll show up here.
              </p>
              <Button className="mt-2" onClick={() => { setOpen(false); router.push("/products"); }}>
                Browse products
              </Button>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li key={item.id} className="flex gap-3">
                  <Link
                    href={`/products/${item.productId}`}
                    onClick={() => setOpen(false)}
                    className="relative h-20 w-16 shrink-0 overflow-hidden rounded-md bg-secondary"
                  >
                    {item.product.thumbnail && (
                      <Image
                        src={item.product.thumbnail}
                        alt={item.product.title}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    )}
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <Link
                      href={`/products/${item.productId}`}
                      onClick={() => setOpen(false)}
                      className="line-clamp-2 text-sm font-medium leading-snug hover:underline"
                    >
                      {item.product.title}
                    </Link>
                    <p className="text-muted-foreground mt-0.5 text-sm">
                      {priceFormatter(item.product.price)}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="inline-flex items-center rounded-md border">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          className="px-2 py-1 text-sm disabled:opacity-40"
                          disabled={pendingItemId === item.id}
                          onClick={() => changeQuantity(item.id, -1)}
                        >
                          −
                        </button>
                        <span className="min-w-8 px-1 text-center text-sm">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          className="px-2 py-1 text-sm disabled:opacity-40"
                          disabled={pendingItemId === item.id}
                          onClick={() => changeQuantity(item.id, 1)}
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        aria-label="Remove item"
                        className="text-muted-foreground hover:text-destructive ml-auto"
                        disabled={pendingItemId === item.id}
                        onClick={() =>
                          changeQuantity(item.id, -item.quantity)
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t px-5 py-4">
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-semibold">{totals.formatted.subtotal}</span>
            </div>
            <p className="text-muted-foreground mb-4 text-xs">
              Shipping &amp; promos calculated at checkout.
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setOpen(false);
                  router.push("/cart");
                }}
              >
                View cart
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  setOpen(false);
                  router.push("/cart");
                }}
              >
                Checkout
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
