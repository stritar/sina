import { defineConfig } from "vitest/config";

// Docs chrome is composed from core primitives — jsdom + jest-axe so the docs
// dogfood the same automated a11y bar core primitives must meet.
export default defineConfig({
  // apps/web's tsconfig uses `jsx: "preserve"` for Next; force the automatic
  // runtime for vitest so test files need no React import.
  esbuild: { jsx: "automatic" },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["node_modules", ".next", ".source"],
    // CSS Modules resolve to the literal flat class name in jsdom.
    css: { modules: { classNameStrategy: "non-scoped" } },
  },
});
