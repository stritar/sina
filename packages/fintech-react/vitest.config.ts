import { defineConfig } from "vitest/config";

// fintech-react ships governed UI composed from core primitives — jsdom so
// jest-axe can run the a11y bar against the rendered dialog, same as core.
export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    // CSS Modules resolve to the literal flat class name in jsdom.
    css: { modules: { classNameStrategy: "non-scoped" } },
  },
});
