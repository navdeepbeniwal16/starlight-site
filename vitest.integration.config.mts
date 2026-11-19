import { defineConfig } from "vitest/config";

// Integration lane: the signup route handler exercised against a real (ephemeral)
// Postgres. Kept separate from the jsdom unit config so `npm test` stays DB-free.
export default defineConfig({
  resolve: {
    // Resolves the "@/*" tsconfig path alias (native in Vite 8+).
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
    },
  },
});
