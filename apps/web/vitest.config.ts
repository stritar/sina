import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Docs chrome is composed from core primitives — jsdom + jest-axe so the docs
// dogfood the same automated a11y bar core primitives must meet.
export default defineConfig({
  // apps/web's tsconfig uses `jsx: "preserve"` for Next; force the automatic
  // runtime for vitest so test files need no React import.
  esbuild: { jsx: "automatic" },
  // Mirror the tsconfig `@/*` path alias — Next resolves it, vite does not, and
  // a test that mocks an aliased module still has to resolve the id.
  resolve: {
    alias: { "@": fileURLToPath(new URL(".", import.meta.url)) },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["node_modules", ".next", ".source"],
    // CSS Modules resolve to the literal flat class name in jsdom.
    css: { modules: { classNameStrategy: "non-scoped" } },
  },
});
