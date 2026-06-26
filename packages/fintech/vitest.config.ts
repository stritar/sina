import { defineConfig } from "vitest/config";

// fintech ships pure Zod schemas — node environment, no DOM.
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
