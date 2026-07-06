import { defineDocs, defineConfig } from "fumadocs-mdx/config";

/**
 * Fumadocs content source (headless). Declares the `content/docs` MDX
 * collection; the `fumadocs-mdx` generator emits `.source` from this at
 * install/build. We use ONLY fumadocs-core (headless) — no fumadocs-ui, no
 * Tailwind. Chrome is authored as SINA CSS Modules over `--sina-*` tokens.
 */
export const docs = defineDocs({
  dir: "content/docs",
});

export default defineConfig();
