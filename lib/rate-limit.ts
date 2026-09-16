import { db } from "@/db";

/**
 * Mongo-backed sliding-window rate limiter. Persists across serverless
 * invocations and instances (unlike an in-process Map), which makes the
 * auth brute-force protection actually hold on Vercel/self-hosted fleets.
 *
 * Fixed window per key: first hit starts a window of `windowMs`; hits are
 * counted until `resetAt`, then the counter resets. Document per key, so
 * a single upsert with `$inc` is atomic — no lost updates under concurrency.
 */

export type RateLimitResult = {
  success: boolean;
  remaining: number;
};

export const rateLimit = async ({
  key,
  limit,
  windowMs,
}: {
  key: string;
  limit: number;
  windowMs: number;
}): Promise<RateLimitResult> => {
  const now = Date.now();
  const resetAt = new Date(now + windowMs);

  // If the window already expired, reset the counter and window atomically.
  await db.rateLimit.updateMany({
    where: { key, resetAt: { lt: new Date(now) } },
    data: { hits: 0, resetAt },
  });

  // Increment the hit count, creating the record on first use.
  const entry = await db.rateLimit.upsert({
    where: { key },
    create: { key, hits: 1, resetAt },
    update: { hits: { increment: 1 } },
  });

  if (entry.hits > limit) {
    return { success: false, remaining: 0 };
  }
  return { success: true, remaining: limit - entry.hits };
};
