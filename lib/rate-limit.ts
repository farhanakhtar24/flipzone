/**
 * Simple in-memory sliding-window rate limiter for server actions.
 * Suitable for single-instance deployments (Vercel serverless functions
 * are ephemeral, so this is best-effort; swap for Upstash Ratelimit when
 * a Redis instance is available).
 */

type RateLimitEntry = {
  timestamps: number[];
};

const store = new Map<string, RateLimitEntry>();

// Periodically clean up stale entries to avoid memory leaks in long-lived servers.
const CLEANUP_INTERVAL_MS = 60_000;
let lastCleanup = Date.now();

const cleanup = (windowMs: number) => {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  const cutoff = now - windowMs;
  store.forEach((entry, key) => {
    entry.timestamps = entry.timestamps.filter((t: number) => t > cutoff);
    if (entry.timestamps.length === 0) store.delete(key);
  });
};

export type RateLimitResult = {
  success: boolean;
  remaining: number;
};

export const rateLimit = ({
  key,
  limit,
  windowMs,
}: {
  key: string;
  limit: number;
  windowMs: number;
}): RateLimitResult => {
  cleanup(windowMs);

  const now = Date.now();
  const cutoff = now - windowMs;
  const entry = store.get(key) ?? { timestamps: [] };

  entry.timestamps = entry.timestamps.filter((t) => t > cutoff);

  if (entry.timestamps.length >= limit) {
    store.set(key, entry);
    return { success: false, remaining: 0 };
  }

  entry.timestamps.push(now);
  store.set(key, entry);

  return { success: true, remaining: limit - entry.timestamps.length };
};
