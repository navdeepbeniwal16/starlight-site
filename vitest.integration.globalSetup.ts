import { execSync } from "node:child_process";

// Apply committed migrations to the ephemeral database once, on boot, before any
// integration test connects. DATABASE_URL points at the service container (CI) or
// a local Postgres.
export default function setup() {
  execSync("npx prisma migrate deploy", { stdio: "inherit" });
}
