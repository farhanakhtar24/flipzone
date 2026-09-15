"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "flipzone:recentlyViewed";
const MAX_ITEMS = 12;

const read = (): string[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed)
      ? parsed.filter((v): v is string => typeof v === "string")
      : [];
  } catch {
    return [];
  }
};

const write = (ids: string[]) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // storage unavailable (private mode etc.) — silently no-op
  }
};

/** Records product views; ids are stored most-recent-first, deduped, capped at 12. */
export function useRecentlyViewed(productId?: string) {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    const current = read();
    if (productId) {
      const next = [productId, ...current.filter((id) => id !== productId)].slice(
        0,
        MAX_ITEMS,
      );
      write(next);
      // exclude the product being viewed from the rail rendering set
      setIds(next.filter((id) => id !== productId));
    } else {
      setIds(current);
    }
  }, [productId]);

  return ids;
}

/** Imperative accessor for server-adjacent helpers (home rails fetch). */
export function getRecentlyViewedIds(): string[] {
  return read();
}
