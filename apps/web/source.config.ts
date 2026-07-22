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

export default defineConfig({
  mdxOptions: {
    // Dual-theme shiki: each token carries both a light and a dark color as CSS
    // variables (`--shiki-light` / `--shiki-dark`). globals.css flips between them
    // on `[data-theme="dark"]`, so code blocks track the SINA theme toggle instead
    // of baking one palette in.
    rehypeCodeOptions: {
      themes: { light: "github-light", dark: "github-dark" },
    },
  },
});
