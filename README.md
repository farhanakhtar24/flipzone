# Flipzone

A full-featured e-commerce storefront built with the Next.js App Router, MongoDB (Prisma), Auth.js v5, Stripe Checkout, and shadcn/ui + Tailwind.

## Features

- **Catalog** — product grid with search, faceted filters (category, brand, price range, rating, discount, in-stock), sorting, and tag chips
- **Product pages** — gallery, specs, star ratings & reviews (authorship tied to your account), wishlist, compare tray
- **Compare** — side-by-side spec table for up to 4 products
- **Cart & checkout** — quantity guards against live stock, saved address book, **Stripe Checkout** with webhook-driven fulfillment
- **Orders** — full lifecycle (`PENDING → PAID → SHIPPED → DELIVERED`, user-cancellable), line-item price snapshots, Resend confirmation email
- **Auth** — GitHub / Google OAuth + credentials (bcrypt), JWT sessions, route middleware
- **UI** — dark mode, responsive, accessible (Radix primitives, labeled controls)
- **Ops** — security headers, rate-limited auth, zod-validated server actions, CI, Docker

## Stack

| Layer     | Tech |
|-----------|------|
| Framework | Next.js 14 (App Router, RSC, server actions) |
| Auth      | Auth.js v5 (JWT + Prisma adapter) |
| DB        | MongoDB + Prisma 5 (transactions, `db push`) |
| Payments  | Stripe Checkout + signed webhooks (test mode) |
| Email     | Resend |
| Styling   | Tailwind, shadcn/ui (new-york), Radix, next-themes |
| Tests     | Vitest + Testing Library, Playwright |
| Deploy    | Vercel + MongoDB Atlas (or `docker compose up`) |

## Quick start

```bash
cp .env.example .env          # fill in DATABASE_URL + AUTH_SECRET (npx auth secret)
npm install
npx prisma db push            # sync schema
npm run seed                  # 100 products + demo user (demo@flipzone.dev / DemoPass123)
npm run dev
```

### Payments (optional but recommended)

```bash
# in another terminal — requires the Stripe CLI
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# copy the printed whsec_… into STRIPE_WEBHOOK_SECRET
```

Checkout works in test mode — use Stripe's `4242 4242 4242 4242` card.

### With Docker

```bash
docker compose up --build
# then seed from the app container:
docker compose exec app npm run seed
```

Compose brings up MongoDB as a **single-node replica set** (Prisma requires transactions).

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` / `start` | Production build / serve |
| `npm run lint` / `typecheck` | ESLint / strict TS |
| `npm run test` / `test:e2e` | Vitest unit + action tests / Playwright smoke |
| `npm run seed` / `db:push` | Seed catalog / push schema |

## Architecture overview

```
app/                     routes (RSC pages, API webhooks)
  api/webhooks/stripe/   payment fulfillment (signature-verified, idempotent)
actions/                 server actions — all identity from session (requireUser)
  → zod-validated input → Prisma transaction → revalidatePath
components/              shadcn/ui primitives + feature components
lib/                     auth-guard, rate-limit, stripe, email
prisma/                  schema + seed
e2e/                     Playwright smoke tests
```

**Security model:** every mutation derives the caller from the server session — no client-supplied `userId`s. Reviews are linked to `User` (edit/delete ownership enforced server-side). See `docs/` for ADRs.

## Environment variables

See [`.env.example`](.env.example). Only `DATABASE_URL` and `AUTH_SECRET` are required; payments/email degrade gracefully when absent.

## License

MIT — see [LICENSE](LICENSE).
