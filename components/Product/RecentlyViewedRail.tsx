"use client";

import { useEffect, useState } from "react";
import { getProductsByIds } from "@/actions/product.action";
import ProductRail from "@/components/Product/ProductRail";
import { useRecentlyViewed } from "@/hooks/use-recently-viewed";
import { IproductWithCartStatus } from "@/interfaces/actionInterface";
import { PAGE_ROUTES } from "@/routes";

type Props = {
  /** Product id currently being viewed (PDP) — excluded from the rail. */
  excludeId?: string;
};

/**
 * Recently-viewed rail backed by localStorage. Fetches product data for the
 * stored ids and renders nothing when the list is empty (first visit).
 */
const RecentlyViewedRail = ({ excludeId }: Props) => {
  const ids = useRecentlyViewed(excludeId);
  const [products, setProducts] = useState<IproductWithCartStatus[]>([]);

  useEffect(() => {
    let cancelled = false;
    if (ids.length === 0) {
      setProducts([]);
      return;
    }
    getProductsByIds(ids.slice(0, 10)).then((res) => {
      if (!cancelled && res.success && res.data) setProducts(res.data);
    });
    return () => {
      cancelled = true;
    };
  }, [ids]);

  if (products.length === 0) return null;

  return (
    <ProductRail
      title="Recently viewed"
      products={products}
      viewAllHref={PAGE_ROUTES.PRODUCTS}
    />
  );
};

export default RecentlyViewedRail;
