import { defineConfig } from "vitest/config";

// The signup route handler against an ephemeral Postgres; kept out of the DB-free
// unit lane.
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "node",
    include: ["src/**/*.integration.test.ts"],
    globalSetup: ["./vitest.integration.globalSetup.ts"],
    setupFiles: ["./vitest.integration.setup.ts"],
    // One shared database: run files serially so per-test truncation stays isolated.
    fileParallelism: false,
    env: {
      TESTFLIGHT_URL: "https://testflight.apple.com/join/TESTSTUB",
      SIGNUP_FORM_SECRET: "integration-secret",
    },
  },
});
