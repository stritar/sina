import { defineConfig } from "vite";
import preserveDirectives from "rollup-preserve-directives";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const pkg = require("./package.json") as {
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
};

// Externalize every dependency + peer (react, @sina-design-system/*,
// @phosphor-icons/react/dist/ssr) — mirrors fintech-react's library build.
const external = [
  ...Object.keys(pkg.dependencies ?? {}),
  ...Object.keys(pkg.peerDependencies ?? {}),
].map((name) => new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(/.*)?$`));

export default defineConfig({
  esbuild: { jsx: "automatic" },
  css: { modules: { localsConvention: "camelCase" } },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    minify: false,
    sourcemap: true,
    // ONE extracted stylesheet for the package → dist/styles.css.
    cssCodeSplit: false,
    rollupOptions: {
      input: ["src/index.ts"],
      external,
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
  plugins: [preserveDirectives()],
});
