import { DEFAULT_LOCALE } from "../locales";
import type { Messages } from "./types";
import { en } from "./en";
import { es } from "./es";
import { zh } from "./zh";
import { fr } from "./fr";
import { de } from "./de";
import { ja } from "./ja";

export type { Messages };

/** Locale code → chrome message catalog. English is the fallback. */
export const MESSAGES: Record<string, Messages> = { en, es, zh, fr, de, ja };

/** The chrome catalog for a locale, falling back to English for anything unknown. */
export function getMessages(locale: string | undefined): Messages {
  return MESSAGES[locale ?? DEFAULT_LOCALE] ?? en;
}
