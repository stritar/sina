import { defineConfig } from "vitest/config";

// Node by default for the pure gate seam; the a11y test opts into jsdom via a
// per-file `@vitest-environment jsdom` docblock. `jsx: automatic` lets the .tsx
// a11y test render without importing React explicitly.
export default defineConfig({
  esbuild: { jsx: "automatic" },
  test: {
    environment: "node",
    include: ["app/**/*.test.{ts,tsx}"],
  },
});
