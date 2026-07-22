import { defineConfig } from "vite";
import preserveDirectives from "rollup-preserve-directives";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const pkg = require("./package.json") as {
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
};

// Externalize every dependency + peer (react, react/jsx-runtime, radix-ui,
// @phosphor-icons/react/dist/ssr, chart.js, clsx, @sina-design-system/*).
const external = [
  ...Object.keys(pkg.dependencies ?? {}),
  ...Object.keys(pkg.peerDependencies ?? {}),
].map((name) => new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(/.*)?$`));

export default defineConfig({
  // esbuild handles the .tsx → JS transform; automatic runtime keeps React external.
  esbuild: { jsx: "automatic" },
  // Flat, readable class names (styles.root, styles.primary, styles.iconLeft).
  css: { modules: { localsConvention: "camelCase" } },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    minify: false, // keep dist readable; parity with the old tsc output ethos
    sourcemap: true,
    // ONE extracted stylesheet for the whole package → dist/styles.css.
    cssCodeSplit: false,
    rollupOptions: {
      input: ["src/index.ts"],
      external,
      // Keep each source module its own chunk so every "use client" stays with
      // its own file (server-safe leaves stay server components).
      preserveEntrySignatures: "strict",
      output: {
        format: "es",
        preserveModules: true,
        preserveModulesRoot: "src",
        entryFileNames: "[name].js",
        assetFileNames: (asset) =>
          asset.name?.endsWith(".css") ? "styles.css" : "[name][extname]",
      },
    },
  },
  plugins: [
    // Hoist/keep each module's "use client" / "use server" directive.
    preserveDirectives(),
  ],
});
