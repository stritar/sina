import { defineConfig } from "vitest/config";

// governance ships the pure contract + engine — node environment, no DOM.
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
