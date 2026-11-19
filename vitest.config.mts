import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Resolves the "@/*" tsconfig path alias (native in Vite 8+).
    tsconfigPaths: true,
  },
  test: {
    // Enables @testing-library/react's automatic cleanup between tests.
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
});
