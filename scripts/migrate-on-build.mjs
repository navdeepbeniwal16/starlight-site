import { execSync } from "node:child_process";

// Runs before `next build` so every Vercel deploy converges its database to the
// committed migrations (via the direct/unpooled connection in prisma7.config.ts).
// Builds with no database configured — local, CI, a fork's preview — have neither
// URL in the real environment, so they skip the step and still succeed. This reads
// process.env only (not .env), which is why a plain local build skips rather than
// touching a developer's database.
const databaseConfigured = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!databaseConfigured) {
  console.log(
    "No database configured (DIRECT_URL/DATABASE_URL unset) — skipping prisma migrate deploy.",
  );
  process.exit(0);
}

execSync("npx prisma migrate deploy", { stdio: "inherit" });
