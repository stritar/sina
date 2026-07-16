/**
 * SINA docs — supported locales (the single source of truth for the locale list).
 *
 * English is the source of truth for all content; the other five are the highest
 * value target languages for AI products (the standard enterprise + developer-tool
 * localisation set). English stays unprefixed at `/docs/...`; every other locale is
 * prefixed at `/<code>/docs/...` (Fumadocs `hideLocale: "default-locale"`).
 *
 * Consumed by: the `LanguageSwitcher`, the `[lang]` route params, the chrome
 * message catalogs, the `docs-i18n` guard, and the Fumadocs i18n config.
 */

export const DEFAULT_LOCALE = "en" as const;

export interface Locale {
  /** BCP-47 short code, also the URL segment (`/es/docs/...`) and MDX infix (`page.es.mdx`). */
  code: string;
  /** Endonym shown in the switcher (the language written in its own script). */
  nativeName: string;
  /** English name, for `aria-label`s and internal copy. */
  englishName: string;
  /** Writing direction. All five targets are LTR; kept explicit for a future RTL locale. */
  dir: "ltr" | "rtl";
}

export const LOCALES: readonly Locale[] = [
  { code: "en", nativeName: "English", englishName: "English", dir: "ltr" },
  { code: "es", nativeName: "Español", englishName: "Spanish", dir: "ltr" },
  { code: "zh", nativeName: "中文", englishName: "Chinese (Simplified)", dir: "ltr" },
  { code: "fr", nativeName: "Français", englishName: "French", dir: "ltr" },
  { code: "de", nativeName: "Deutsch", englishName: "German", dir: "ltr" },
  { code: "ja", nativeName: "日本語", englishName: "Japanese", dir: "ltr" },
] as const;

/** Every locale code, English first. */
export const LOCALE_CODES: readonly string[] = LOCALES.map((l) => l.code);

/** The five translated locales (everything except the default English source). */
export const TRANSLATED_LOCALE_CODES: readonly string[] = LOCALE_CODES.filter(
  (code) => code !== DEFAULT_LOCALE,
);

/** A locale code is one we support. */
export function isLocale(code: string): boolean {
  return LOCALE_CODES.includes(code);
}

/** Look up a locale by code, defaulting to English for anything unknown. */
export function localeOf(code: string | undefined): Locale {
  return LOCALES.find((l) => l.code === code) ?? LOCALES[0]!;
}
