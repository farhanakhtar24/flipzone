"use client";

import { createContext, useContext, useState } from "react";

type CartDrawerContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const CartDrawerContext = createContext<CartDrawerContextValue | null>(null);

export const useCartDrawer = () => {
  const ctx = useContext(CartDrawerContext);
  if (!ctx) throw new Error("useCartDrawer must be used inside CartDrawerProvider");
  return ctx;
};

const CartDrawerProvider = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  return (
    <CartDrawerContext.Provider value={{ open, setOpen }}>
      {children}
    </CartDrawerContext.Provider>
  );
};

export default CartDrawerProvider;
