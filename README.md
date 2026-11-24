# Starlight

Marketing + beta-waitlist site for Starlight. Built on Next.js (App Router) with a
merge-gating CI pipeline and deploy-on-green via Vercel.

## Stack

- **Next.js 16** (App Router) + **React 19**, **TypeScript** (strict)
- **Tailwind CSS v4**
- **Prisma 7** (Postgres, driver adapters) — the `signup` system-of-record + migrations
- **HubSpot** — best-effort CRM sync behind a swappable client (no-op when unconfigured)
- **Sanity** — structured-singleton CMS for the landing page, with Studio at `/studio`
- **Vitest** + Testing Library (unit) and **Playwright** (E2E)
- **Vercel** hosting + Speed Insights + Cron
- **PostHog** (EU cloud) — cookieless analytics, conversion funnels, runtime error tracking

## Getting started

```bash
npm install           # postinstall runs `prisma generate`
cp .env.example .env   # set DATABASE_URL (Postgres), TESTFLIGHT_URL, SIGNUP_FORM_SECRET
                       # DIRECT_URL is optional locally (falls back to DATABASE_URL)
                       # Sanity vars are optional locally (site uses static copy)
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

## Signup abuse protection

Both signup forms carry proportionate, zero-friction bot defense (`src/lib/signup/abuse.ts`),
tuned to never trip a real user — including one on assistive tech:

- **Honeypot** — an off-screen, `aria-hidden` text input (never `type=hidden`) that
  humans and screen readers skip but a form-filling bot populates.
- **Time-trap** — each form renders an HMAC-signed timestamp (signed per request with
  `SIGNUP_FORM_SECRET`, so the field sits outside the page's static shell). The route
  rejects a submission with a bad/missing signature, one submitted faster than a human
  could fill the form, or one whose token has gone stale.

A tripped guard returns a **silent fake-success** — the same response a real signup
gets — and writes no row, so a bot can't tell it was dropped. An email-syntax error
still surfaces inline. Set `SIGNUP_FORM_SECRET` (any high-entropy string, stable across
instances) in the Vercel project env vars.

## Analytics & conversion funnels (PostHog)

Instrumentation runs on **PostHog EU cloud**, cookieless by default. The browser SDK uses
in-memory persistence — no cookies, no local/session storage for identity — so an anonymous
visitor's `distinct_id` lives only for the current page load and never persists across
sessions, which is why the site needs **no consent banner**. Autocapture, session replay, and
surveys are all off; the five manual events below are the entire surface. Everything stands
down when `NEXT_PUBLIC_POSTHOG_KEY` is unset (local, CI, unconfigured deploys): the client SDK
never initializes and the server client is a no-op fake — the same posture as the HubSpot
client — so nothing reaches PostHog unless it's deliberately configured.

### Events

| Event                 | Side   | Fires when                                        | Props                   |
| --------------------- | ------ | ------------------------------------------------- | ----------------------- |
| `$pageview`           | client | each page load / client-side route change         | —                       |
| `cta_click`           | client | a signup CTA button is clicked                     | `cta` (segment), `location` |
| `signup_submitted`    | client | a form passes browser validation and submits       | `segment`               |
| `signup_committed`    | server | a **new** signup row commits to Postgres           | `segment`, `country?`   |
| `testflight_redirect` | server | a beta signup is 303'd to TestFlight               | `segment`, `country?`   |

`signup_committed` fires once per newly-created row (never on a duplicate submit, never for a
tripped bot), so its per-segment count equals the `signup` table. Both server events are keyed
by the normalized email as `distinct_id` — the same key the client identify uses — so they land
on one person.

### Identity, consent, and merging

A visitor stays anonymous until a **consented** submit calls `identify()` with the raw
(normalized) email as `distinct_id` and person properties: the segment flag
(`launch_waitlist` / `beta_tester`), first-touch UTM (set-once), and `consent_at`. PostHog
merges the anonymous pre-submit events into that person on identify. An **unticked** consent
box still stores the signup and still fires `signup_committed`, but with person processing off
(`$process_person_profile: false`) — no profile is created and no email is attached to a person.

### What's captured, and what isn't

- **UTM** — first-touch UTM is read client-side (kept in `sessionStorage`, not a cookie, so a
  mid-funnel redirect that strips the query string — e.g. `?status=invalid` — doesn't lose it),
  posted on the form, and **persisted to the signup row** (`utm_*` columns). It also rides on
  the consented identify as set-once person props.
- **Geo** — country only. Vercel resolves the edge IP to an ISO code (`x-vercel-ip-country`)
  that rides on the server events as `country`; the raw IP is never read or stored, and
  PostHog's own GeoIP enrichment is disabled server-side.
- **No referrer, no fingerprint, no cookies** — referrer properties sit in the SDK denylist,
  and ad-id URL params (gclid, fbclid, …) are masked out before anything leaves the browser.

### Error tracking

Runtime errors feed PostHog error tracking (this satisfies the Ops runtime-error monitoring
requirement): the client SDK autocaptures unhandled exceptions (`capture_exceptions`), and
`src/instrumentation.ts`'s `onRequestError` forwards every server error — the signup API
included, which also reports its write failures explicitly from the route's catch.

### Funnels (defined in the PostHog UI)

Two funnels, both built from the events above:

1. **Launch waitlist** — `$pageview` → `cta_click` → `signup_submitted` → `signup_committed`,
   with the two signup steps filtered to `segment = launch_waitlist`.
2. **Beta** — the same four steps filtered to `segment = beta_tester`, then a final
   `testflight_redirect`.

## Content (Sanity CMS)

The landing page is a **structured singleton**, not a page builder: code owns which
sections exist and their order (`src/sanity/schemaTypes`), Sanity owns the copy and
media inside each. Two pinned singletons — `landingPage` and `siteSettings` — are
edited in the embedded **Studio at `/studio`**, so an editor changes marketing copy,
media, and the TestFlight link with no deploy.

- **Typed fetch layer** (`src/sanity/lib`) — hand-written types mirror the GROQ
  projections; `getLandingPage()` / `getSiteSettings()` are the only entry points.
  Both **return `null` when Sanity isn't configured** (no `NEXT_PUBLIC_SANITY_PROJECT_ID`),
  so local and CI builds fall back to the static copy in `src/lib/site.ts` instead of
  failing — the same no-op posture as the HubSpot client.
- **Validation** — every image requires alt text, display-critical strings carry soft
  max-length warnings, and `howItWorks` must have 2–4 steps.
- **ISR + webhook** — reads are cached (`use cache` + a long `cacheLife`) and tagged
  `sanity:content`. Publishing fires a Sanity webhook to `POST /api/revalidate`, which
  verifies the `SANITY_REVALIDATE_SECRET` HMAC signature and calls `revalidateTag`, so
  the live page refreshes without a timer or a redeploy.
- **`testFlightUrl`** lives once in `siteSettings`; the `TESTFLIGHT_URL` env var is only
  the fallback for when Sanity isn't configured.

## Privacy & terms

`/privacy` and `/terms` are the legal carve-out to the one-page site — two thin static
routes that render Portable Text rather than marketing sections. A third pinned
singleton, `legal`, holds both documents (`privacy` and `terms`, each a title, a
last-updated date, and a richer Portable Text body that allows headings and lists),
edited in the same Studio.

- **Same fetch posture** — `getLegal()` reads the singleton through the typed layer and
  is cached under the shared `sanity:content` tag, so a publish already revalidates both
  routes. It returns `null` when Sanity isn't configured.
- **No static fallback** — unlike the marketing sections, there is deliberately no
  hand-coded copy to fall back to: a stale privacy or terms policy is worse than none, so
  when the document is missing the route renders an "isn't available" message instead.
  The live copy is authored and published in Studio.
- **What the privacy note should disclose** — what's collected (email, which list,
  first-touch UTM, consent timestamp, country, anonymous events), the four processors
  (Neon, HubSpot, PostHog, Vercel), cookieless tracking, consent as the lawful basis, the
  TestFlight handoff to Apple, unsubscribe and delete rights, no data sale, and retention.
- **Footer** — the footer's Privacy and Terms links resolve to these routes.

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
   [Database connections](#database-connections)), `TESTFLIGHT_URL`, `SIGNUP_FORM_SECRET`
   (see [Signup abuse protection](#signup-abuse-protection)), the `HUBSPOT_*` vars,
   `CRON_SECRET` (see [HubSpot sync](#hubspot-sync--reconciliation)), the
   `NEXT_PUBLIC_SANITY_*` + `SANITY_REVALIDATE_SECRET` vars (see [Content](#content-sanity-cms)),
   and the `NEXT_PUBLIC_POSTHOG_*` vars (see [Analytics](#analytics--conversion-funnels-posthog))
   in the Vercel project env vars.
3. **Create the Sanity project & publish webhook** — create a project with a
   `production` dataset, set its id as `NEXT_PUBLIC_SANITY_PROJECT_ID`, and add a Sanity
   webhook (on publish) that POSTs to `/api/revalidate` with the shared
   `SANITY_REVALIDATE_SECRET`. See [Content](#content-sanity-cms).
4. **Branch protection** — require the `lint`, `typecheck`, `unit`,
   `integration`, and `e2e` checks on `main` (also configurable via `gh api`).
5. **Create the PostHog project & funnels** — create an EU-cloud project, set its API key as
   `NEXT_PUBLIC_POSTHOG_KEY`, and build the two conversion funnels in the UI (see
   [Analytics](#analytics--conversion-funnels-posthog)). Error tracking and the events need no
   dashboard setup beyond the key.
