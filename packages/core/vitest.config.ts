import { defineConfig } from "vitest/config";

// core ships accessible UI primitives — jsdom environment so jest-axe can run
// the a11y bar (focus-trap + ARIA + keyboard) against rendered DOM.
export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    // vitest-canvas-mock (Chart.js needs a 2D context; jsdom has none) must be
    // inlined so its jest-shim resolution runs inside the vitest pipeline.
    deps: { optimizer: { web: { include: ["vitest-canvas-mock"] } } },
  },
});
