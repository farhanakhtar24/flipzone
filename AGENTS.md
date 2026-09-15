# AGENTS.md — Flipzone agent guide

## What this is
Next.js 14 e-commerce app (App Router, RSC, server actions). MongoDB via Prisma, Auth.js v5 (JWT), Stripe Checkout, Resend, shadcn/ui + Tailwind, zod.

## Commands
- `npm run dev` — dev server (needs `.env`, see below)
- `npm run build` — production build (CI gate)
- `npm run lint`, `npm run typecheck` — ESLint / `tsc --noEmit` (CI gates)
- `npm run test` — Vitest unit + action tests (jsdom)
- `npm run test:e2e` — Playwright smoke specs (`e2e/`)
- `npx prisma db push` — **schema sync; there are no migrations** (MongoDB provider)
- `npm run seed` — loads 100 dummyjson products, categories, reviews, demo user (demo@flipzone.dev / DemoPass123)
- `docker compose up --build` — app + Mongo single-node replica set `rs0` (Prisma transactions need it; see docs/adr/0004)

## Rules that will bite you if ignored
1. **Never take identity from the client.** All server actions call `requireUser()` / `requireAdmin()` from `lib/auth-guard.ts` and use `session.user.id`. New actions must follow this (docs/adr/0002). Verify ownership inside the transaction (`findFirst({ where: { id, userId } })` / `deleteMany({ where: { id, userId } })`).
2. **Validate every action input with zod first** (404/400 ApiResponse envelope: `{ statusCode, success, message, data?, error? }`).
3. **Payment flow is webhook-driven** (docs/adr/0003): checkout creates a `PENDING` order; only `/api/webhooks/stripe` decrements stock / clears the cart, idempotently (act on PENDING only). Don't add "place order" write paths elsewhere.
4. **OrderedItem carries snapshots** (`unitPrice`, `title`, `thumbnail`) — display orders from snapshot fields, not the live `Product`.
5. `Product.price` is **integer dollars** (seed data), not cents. Stripe conversion: `Math.round(price * 100)`.
6. Revalidate with `revalidatePath("/", "layout")` after mutations (established pattern).
7. Protected routes live in `middleware.ts`; adding a private page also means adding it there (+ `robots.ts` disallow).
8. Webhook route must read `request.text()` before any JSON parsing (signature verification).

## Layout of the code
- `app/` — routes; feature components colocated in `_components/`. Route group `(profile-section)` shares sidebar layout (profile/wishlist/orders/compare).
- `actions/` — one file per domain (`product`, `cart`, `order`, `checkout`, `address`, `admin`, `comparison`, `reviews`, `wishlist`, `auth`, `user`, `category`).
- `components/ui` — shadcn (new-york style, gray base). `components/{Navbar,Product,Address,Wrapper,...}` — feature components.
- `hooks/use-query-params.ts` — URL search params are the client state store for filters/search.
- `context/SessionContext.tsx` — the only app-wide context (Auth.js SessionProvider).
- Auth split: `auth.config.ts` (edge-safe providers) + `auth.ts` (adapter, callbacks, session/JWT role+id). `next.declare.d.ts` augments Session with `id` + `role`.

## Testing conventions
- Unit tests next to source (`*.test.ts`) — schemas, helpers, and server actions with `vi.mock("@/db")` + `vi.mock("@/auth")`.
- E2E in `e2e/`. CI (`.github/workflows/ci.yml`): install → prisma generate → lint → typecheck → unit → build. Keep all gates green.

## Env
Copy `.env.example`. Minimum to boot: `DATABASE_URL`, `AUTH_SECRET`. Stripe/Resend degrade gracefully when absent. **Never commit `.env`** — the repo history once leaked secrets (see README security note); rotation + scrub procedure is in the project plan.

## Conventions
- TS strict; path alias `@/*`.
- Conventional-ish commit messages (`feat:`, `security:`, `test/infra:` as used in history); branch per phase, squash merge.
- Tailwind tokens over hardcoded colors (`bg-background`, `text-muted-foreground`, …) so dark mode keeps working.
- No TODO/FIXME accumulation — comment only non-obvious decisions.
