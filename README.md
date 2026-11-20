# Starlight

Marketing + beta-waitlist site for Starlight. Built on Next.js (App Router) with a
merge-gating CI pipeline and deploy-on-green via Vercel.

## Stack

- **Next.js 16** (App Router) + **React 19**, **TypeScript** (strict)
- **Tailwind CSS v4**
- **Prisma 7** (Postgres, driver adapters) — the `signup` system-of-record + migrations
- **HubSpot** — best-effort CRM sync behind a swappable client (no-op when unconfigured)
- **Vitest** + Testing Library (unit) and **Playwright** (E2E)
- **Vercel** hosting + Speed Insights + Cron

## Getting started

```bash
npm install           # postinstall runs `prisma generate`
cp .env.example .env   # set DATABASE_URL (Postgres) and TESTFLIGHT_URL
                       # DIRECT_URL is optional locally (falls back to DATABASE_URL)
npm run dev            # http://localhost:3000
```

## Scripts

| Script              | What it does                                        |
| ------------------- | --------------------------------------------------- |
| `npm run dev`       | Start the dev server                                |
| `npm run build`     | Apply pending migrations (if a DB is set), then build |
| `npm start`         | Serve the production build                           |
| `npm run lint`      | ESLint                                              |
| `npm run typecheck` | Generate route types, then `tsc --noEmit`           |
| `npm run test`      | Vitest unit tests                                   |
| `npm run test:integration` | Vitest integration tests (needs Postgres via `DATABASE_URL`) |
| `npm run test:e2e`  | Playwright E2E (builds + serves, then smokes `/`)   |

## Database connections

The app uses **two** Postgres connection strings, by design — keep both:

- **`DATABASE_URL` (pooled)** — the runtime connection for serverless functions.
  Many short-lived function invocations share a small pool, so this points at the
  pooler (on Neon, the `-pooler` host). Used by the Prisma driver adapter in
  `src/lib/db.ts`.
- **`DIRECT_URL` (direct/unpooled)** — the migration connection. `prisma migrate
  deploy` issues DDL, which a pooler like PgBouncer can't carry, so it needs a
  direct connection. Used by `prisma7.config.ts`, which also reads
  `DATABASE_URL_UNPOOLED` — the name the Neon–Vercel integration injects for the
  direct connection (including on each preview branch).

Locally and in CI there's no pooler, so `DIRECT_URL` can be left unset — migrations
fall back to `DATABASE_URL`. In production each must point at its matching host.

## HubSpot sync & reconciliation

The durable `signup` write is the source of truth; the CRM sync is best-effort and
downstream of it. A swappable client (`src/lib/hubspot`) talks to HubSpot only when
`HUBSPOT_ACCESS_TOKEN` is set — otherwise a no-op fake stands in, so local, CI, and
unconfigured deploys never make a real call (and tests always use a fake).

- **Write path** — after a signup commits, the route upserts the contact off the
  response via Next's [`after()`](https://nextjs.org/docs/app/api-reference/functions/after).
  A HubSpot failure never fails the user's signup; the row just persists with
  `synced_at = null`. Upsert-by-email keeps every attempt idempotent.
- **Cron sweep** — `vercel.json` schedules `/api/cron/sync` once daily (the Vercel
  Hobby plan caps crons at one run per day; a shorter interval needs Pro) to re-upsert
  `synced_at IS NULL` rows, stamping `synced_at` on success and incrementing
  `sync_attempts` on failure. A **soft cap** (`HUBSPOT_SYNC_MAX_ATTEMPTS`, default 5)
  stops auto-retrying a row that keeps failing, leaving it for inspection.
- **Manual recovery** — `POST /api/resync` re-runs the same reconciliation on demand,
  the escape hatch when a failed sync shouldn't wait for the daily sweep.

Both endpoints are protected by the `CRON_SECRET` bearer token (Vercel injects it on
cron invocations). Set `HUBSPOT_*` and `CRON_SECRET` in the Vercel project env vars.

## Continuous integration

`.github/workflows/ci.yml` runs five jobs on every pull request (and on pushes to
`main`): **lint**, **typecheck**, **unit**, **integration** (signup route handler
against an ephemeral Postgres service container), and **e2e**. `main` is
branch-protected so a red run blocks merge.

## Deployment

Vercel's GitHub integration builds a **preview deploy per pull request** and
**auto-deploys production on merge to `main`**. [Speed Insights](https://vercel.com/docs/speed-insights)
is mounted in the root layout.

**Deploys self-migrate.** `npm run build` runs `prisma migrate deploy` (on the
direct connection) before `next build`, so every deploy converges its database to
the committed migrations. A build with no database configured — a local build, CI,
or a fork's preview — skips the step and still succeeds.

### One-time setup (dashboard, outside this repo)

These steps need Vercel/GitHub account access and are not scripted here:

1. **Link the repo in Vercel** — import `starlight-site`, framework preset "Next.js".
   This enables PR preview URLs and production deploys on merge.
2. **Set `DATABASE_URL`** (pooled), **`DIRECT_URL`** (direct/unpooled — see
   [Database connections](#database-connections)), `TESTFLIGHT_URL`, the `HUBSPOT_*`
   vars, and `CRON_SECRET` (see [HubSpot sync](#hubspot-sync--reconciliation)) in the
   Vercel project env vars.
3. **Branch protection** — require the `lint`, `typecheck`, `unit`,
   `integration`, and `e2e` checks on `main` (also configurable via `gh api`).
