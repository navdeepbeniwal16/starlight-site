# Starlight

Marketing + beta-waitlist site for Starlight. Built on Next.js (App Router) with a
merge-gating CI pipeline and deploy-on-green via Vercel.

## Stack

- **Next.js 16** (App Router) + **React 19**, **TypeScript** (strict)
- **Tailwind CSS v4**
- **Prisma 7** (Postgres, driver adapters) — the `signup` system-of-record + migrations
- **Vitest** + Testing Library (unit) and **Playwright** (E2E)
- **Vercel** hosting + Speed Insights

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
   [Database connections](#database-connections)), and `TESTFLIGHT_URL` in the
   Vercel project env vars.
3. **Branch protection** — require the `lint`, `typecheck`, `unit`,
   `integration`, and `e2e` checks on `main` (also configurable via `gh api`).
