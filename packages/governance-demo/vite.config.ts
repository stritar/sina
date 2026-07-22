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
    // The registry mounts components through `React.lazy(() => import(…))`. By default
    // Vite wraps every dynamic import in its `__vitePreload` helper, which reaches for
    // `document.getElementsByTagName("link")` — unguarded. That is fine in an app that
    // only ever runs in a browser, and fatal here: the consuming Next app evaluates the
    // same code during SSR and prerender, and the docs build dies with "document is not
    // defined". A library must emit a plain `import()` and let the host bundler decide
    // how to preload it.
    modulePreload: false,
    rollupOptions: {
      // Two entries: the full package (console UI), and the React-free `./server`
      // half a server runtime imports — see src/server.ts for why that split is
      // load-bearing for the Cloudflare worker.
      input: ["src/index.ts", "src/server.ts"],
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
