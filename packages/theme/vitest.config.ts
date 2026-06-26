import { defineConfig } from "vitest/config";

// theme ships no React — tokens are plain data + CSS, so a node environment is
// enough. Tests read theme.css / tailwind.cjs from disk to guard against drift
// and assert WCAG contrast on the semantic palette.
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
