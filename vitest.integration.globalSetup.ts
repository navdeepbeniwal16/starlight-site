import { execSync } from "node:child_process";

// Apply committed migrations to the ephemeral database before any test connects.
export default function setup() {
  execSync("npx prisma migrate deploy", { stdio: "inherit" });
}
