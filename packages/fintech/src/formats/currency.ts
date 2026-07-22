/**
 * ISO 4217 currency codes + minor-unit exponents.
 *
 * Amounts are represented as **integer minor units** (Stripe / ISO 20022 backend
 * model): `{ amount: 6_000_000, currency: "USD" }` = $60,000.00. The exponent
 * table says how many fractional digits a currency has (USD=2, JPY=0, BHD=3),
 * so a major-unit figure can be converted to minor units exactly once.
 *
 * @see ISO 4217
 * @see https://docs.stripe.com/currencies (zero-decimal & minor-unit model)
 */

import { z } from "zod";

/** Currencies this constitution supports (each has a known minor-unit exponent). */
export const SUPPORTED_CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "CAD",
  "AUD",
  "CHF",
  "JPY",
  "BHD",
] as const;

export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number];

/** ISO 4217 alphabetic code, restricted to the supported set. */
export const currencyCode = z.enum(SUPPORTED_CURRENCIES);

/** Minor-unit exponent (decimal places) per ISO 4217. */
export const MINOR_UNIT_EXPONENT: Record<CurrencyCode, number> = {
  USD: 2,
  EUR: 2,
  GBP: 2,
  CAD: 2,
  AUD: 2,
  CHF: 2,
  JPY: 0, // zero-decimal
  BHD: 3,
};

/** Convert a major-unit figure (e.g. dollars) to integer minor units for a currency. */
export function toMinorUnits(major: number, currency: CurrencyCode): number {
  return Math.round(major * 10 ** MINOR_UNIT_EXPONENT[currency]);
}

/** Convenience: US dollars → integer cents. Used by thresholds and fixtures. */
export function usd(dollars: number): number {
  return toMinorUnits(dollars, "USD");
}
