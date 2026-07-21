import { defineConfig } from "vitest/config";

// Node by default for the pure gate seam; the a11y test opts into jsdom via a
// per-file `@vitest-environment jsdom` docblock. `jsx: automatic` lets the .tsx
// a11y test render without importing React explicitly.
export default defineConfig({
  esbuild: { jsx: "automatic" },
  test: {
    environment: "node",
    include: ["app/**/*.test.{ts,tsx}"],
    // The emulator a11y test renders a lazy `ChatThread` (dynamic `fintech-react → core`
    // import chain) behind two 5s `findBy*` waits, then a full-tree axe scan. On a cold CI
    // runner that exceeds Vitest's default 5000ms per-test budget — and an aborted axe run
    // leaves axe-core's global lock held, cascading into the next test. 20s gives headroom.
    testTimeout: 20000,
  },
});
