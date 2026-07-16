import { LOCALE_CODES } from "./locales";
import { basePath, toLocalePath } from "./paths";

/**
 * `hreflang` alternates for a docs page, keyed by locale plus `x-default`
 * (English). `pageUrl` is the loader's locale-aware URL (`/docs/x` for English,
 * `/es/docs/x` for a translation); we derive the English base and fan out.
 *
 * A plain string map — assignable to both a page's `alternates.languages` and a
 * sitemap entry's `alternates.languages`.
 */
export function languageAlternates(pageUrl: string): Record<string, string> {
  const base = basePath(pageUrl);
  const languages: Record<string, string> = {};
  for (const code of LOCALE_CODES) languages[code] = toLocalePath(base, code);
  languages["x-default"] = base;
  return languages;
}
