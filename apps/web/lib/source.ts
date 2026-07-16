import { docs } from "@/.source/server";
import { loader } from "fumadocs-core/source";
import { i18n } from "@/lib/i18n/fumadocs";

/**
 * The headless docs source: the loader gives us `getPage`, `getPages`,
 * `getPageTree`, and `generateParams` over the `content/docs` collection. We
 * render the result with our own CSS-Module chrome (no fumadocs-ui).
 *
 * i18n-enabled: `getPage(slug, locale)` resolves a `<page>.<locale>.mdx` sibling
 * (falling back to English), and `pageTree` becomes a per-locale record — read a
 * single locale's tree with `source.getPageTree(locale)`.
 */
export const source = loader({
  baseUrl: "/docs",
  i18n,
  source: docs.toFumadocsSource(),
});
