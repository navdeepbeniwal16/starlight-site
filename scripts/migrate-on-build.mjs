import { execSync } from "node:child_process";

// Reads the real environment only, never .env, so a plain local build (and CI, and
// fork previews) skips migrating instead of touching a developer's database.
// Loading .env here would break that.
const databaseConfigured = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!databaseConfigured) {
  console.log(
    "No database configured (DIRECT_URL/DATABASE_URL unset) — skipping prisma migrate deploy.",
  );
  process.exit(0);
}

execSync("npx prisma migrate deploy", { stdio: "inherit" });
