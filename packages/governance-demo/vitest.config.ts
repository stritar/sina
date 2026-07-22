import { defineConfig } from "vitest/config";

// The gate suite is pure logic; the a11y suite renders the read-only console —
// jsdom + jest-axe, same automated bar as core/fintech-react.
export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    css: { modules: { classNameStrategy: "non-scoped" } },
  },
});
