"use client";

import { useEffect, useState } from "react";
import HomePage from "./HomePage";
import { getHomeRails, HomeRails } from "@/actions/product.action";
import { getRecentlyViewedIds } from "@/hooks/use-recently-viewed";
import { Category } from "@prisma/client";

/**
 * Client loader for the home page: reads the guest's recently-viewed ids from
 * localStorage BEFORE calling the rails action, so the "recommended" rail can
 * be personalized on the very first paint after hydration.
 */
const HomePageLoader = ({ categories }: { categories: Category[] }) => {
  const [rails, setRails] = useState<HomeRails | null>(null);
  const [recommendedIds] = useState<string[]>(() =>
    typeof window === "undefined" ? [] : getRecentlyViewedIds(),
  );

  useEffect(() => {
    let cancelled = false;
    getHomeRails(recommendedIds).then((res) => {
      if (!cancelled && res.success && res.data) setRails(res.data);
    });
    return () => {
      cancelled = true;
    };
  }, [recommendedIds]);

  return <HomePage categories={categories} rails={rails} />;
};

export default HomePageLoader;
