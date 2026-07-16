import { defineI18n } from "fumadocs-core/i18n";
import { DEFAULT_LOCALE, LOCALE_CODES } from "./locales";

/**
 * Fumadocs i18n config for the docs loader + search.
 *
 * - `parser: "dot"` reads translations as `<page>.<locale>.mdx` siblings.
 * - `hideLocale: "default-locale"` keeps English unprefixed (`/docs/...`) and
 *   prefixes every other locale (`/es/docs/...`), matching the physical routes
 *   (`app/docs` for English, `app/[lang]/docs` for the rest). We route locales
 *   explicitly, so no i18n middleware is needed.
 * - `fallbackLanguage: "en"` renders English when a page has no translation yet.
 */
export const i18n = defineI18n({
  defaultLanguage: DEFAULT_LOCALE,
  languages: [...LOCALE_CODES],
  hideLocale: "default-locale",
  parser: "dot",
  fallbackLanguage: DEFAULT_LOCALE,
});
