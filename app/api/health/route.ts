import { db } from "@/db";
import { NextResponse } from "next/server";

/**
 * Liveness/readiness probe for Docker, uptime checks, and CI. Verifies DB
 * connectivity with a lightweight command rather than a collection read.
 */
export const GET = async () => {
  const start = Date.now();
  try {
    // `$runCommandRaw({ ping: 1 })` avoids loading any documents.
    await db.$runCommandRaw({ ping: 1 });
    return NextResponse.json({
      ok: true,
      db: "up",
      latencyMs: Date.now() - start,
    });
  } catch (error) {
    console.error("Health check failed:", error);
    return NextResponse.json(
      { ok: false, db: "down", latencyMs: Date.now() - start },
      { status: 503 },
    );
  }
};
