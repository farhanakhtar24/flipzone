"use client";

import { useRecentlyViewed } from "@/hooks/use-recently-viewed";

/** Mounts on the PDP to record the visit into the recently-viewed list. */
const RecordView = ({ productId }: { productId: string }) => {
  useRecentlyViewed(productId);
  return null;
};

export default RecordView;
