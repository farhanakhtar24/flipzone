# 0001 — Server actions over REST API routes

**Status:** Accepted
**Date:** 2026-09 (recorded retroactively; in effect since Phase 0)

## Context

The app originally mixed a public REST route (`/api/register`) with server
actions. The REST route bypassed the zod validation that only lived in the
action layer, returned HTTP 200 for errors, and forced an axios
self-call from `signUp` — an extra network hop with its own failure modes.

## Decision

All reads/mutations go through **server actions** in `/actions`. The only
remaining route handlers are `/api/auth/*` (Auth.js) and
`/api/webhooks/stripe` (third-party callback that must read the raw body).

## Consequences

- One validation path (`zod.safeParse` at the top of every action).
- One auth path (`requireUser()` / `requireAdmin()` from `lib/auth-guard.ts`).
- Type-safe calls from client components — no request/response types to drift.
- Third-party ingress (Stripe) stays in a route handler where raw-body access
  and pure-HTTP semantics are required.
