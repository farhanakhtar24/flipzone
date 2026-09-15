# 0002 — Session-derived identity in all mutations

**Status:** Accepted
**Date:** Phase 0 (security hardening)

## Context

Every mutation used to accept `userId` / `cartId` / `reviewerEmail` from the
client. That made authorization a string comparison against attacker-controlled
input: read/modify anyone's cart, wishlist, orders, profile; place orders from
another user's cart; edit/delete any review.

## Decision

Server actions **never accept identity parameters**. `requireUser()` derives
the caller from the Auth.js session; ownership is verified against
`session.user.id` inside the transaction. Reviews gained a real
`reviewer → User` relation instead of a bare email string.

## Consequences

- IDOR class eliminated by construction — there is no client identity to forge.
- Slightly more DB round-trips on writes (ownership lookups); acceptable.
- Client call sites got simpler (no `useSession` plumbing for IDs).
- Reviews survive reviewer-name changes; seeded reviews attach to a demo user.
