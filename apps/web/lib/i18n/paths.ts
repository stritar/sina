import { DEFAULT_LOCALE, TRANSLATED_LOCALE_CODES } from "./locales";

/**
 * URL <-> locale mapping. English is unprefixed (`/docs/...`, `/`); every other
 * locale is prefixed (`/es/docs/...`, `/es`). Fumadocs is configured with
 * `hideLocale: "default-locale"`, so these mirror the routes it serves.
 */

/** The locale a pathname belongs to (English if it carries no known prefix). */
export function localeFromPath(pathname: string): string {
  const seg = pathname.split("/")[1];
  return seg && TRANSLATED_LOCALE_CODES.includes(seg) ? seg : DEFAULT_LOCALE;
}

/** Strip a translated-locale prefix, returning the base (English) path. */
export function basePath(pathname: string): string {
  const locale = localeFromPath(pathname);
  if (locale === DEFAULT_LOCALE) return pathname || "/";
  const rest = pathname.slice(`/${locale}`.length);
  return rest === "" ? "/" : rest;
}

/** Rewrite `pathname` (in any locale) to its equivalent in `target`. */
export function toLocalePath(pathname: string, target: string): string {
  const base = basePath(pathname);
  if (target === DEFAULT_LOCALE) return base;
  return base === "/" ? `/${target}` : `/${target}${base}`;
}
