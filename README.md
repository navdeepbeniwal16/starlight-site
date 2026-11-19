# Starlight

Marketing + beta-waitlist site for Starlight. Built on Next.js (App Router) with a
merge-gating CI pipeline and deploy-on-green via Vercel.

## Stack

- **Next.js 16** (App Router) + **React 19**, **TypeScript** (strict)
- **Tailwind CSS v4**
- **Prisma** toolchain (Postgres) — the signup schema lands in a later ticket
- **Vitest** + Testing Library (unit) and **Playwright** (E2E)
- **Vercel** hosting + Speed Insights

## Getting started

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL when the DB-backed work begins
npm run dev            # http://localhost:3000
```

## Scripts

| Script              | What it does                                        |
| ------------------- | --------------------------------------------------- |
| `npm run dev`       | Start the dev server                                |
| `npm run build`     | Production build                                    |
| `npm start`         | Serve the production build                           |
| `npm run lint`      | ESLint                                              |
| `npm run typecheck` | Generate route types, then `tsc --noEmit`           |
| `npm run test`      | Vitest unit tests                                   |
| `npm run test:e2e`  | Playwright E2E (builds + serves, then smokes `/`)   |

## Continuous integration

`.github/workflows/ci.yml` runs four jobs on every pull request (and on pushes to
`main`): **lint**, **typecheck**, **unit**, and **e2e**. `main` is branch-protected
so a red run blocks merge.

## Deployment

Vercel's GitHub integration builds a **preview deploy per pull request** and
**auto-deploys production on merge to `main`**. [Speed Insights](https://vercel.com/docs/speed-insights)
is mounted in the root layout.

### One-time setup (dashboard, outside this repo)

These steps need Vercel/GitHub account access and are not scripted here:

1. **Link the repo in Vercel** — import `starlight-site`, framework preset "Next.js".
   This enables PR preview URLs and production deploys on merge.
2. **Set `DATABASE_URL`** in the Vercel project env vars once DB work begins.
3. **Branch protection** — require the `lint`, `typecheck`, `unit`, and `e2e`
   checks on `main` (also configurable via `gh api`).
