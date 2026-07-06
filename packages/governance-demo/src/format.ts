/**
 * Display helpers for the emulator. Amounts are ISO-4217 minor units (the wire
 * constitution's model); convert to major units per currency for display.
 */

import { MINOR_UNIT_EXPONENT, type CurrencyCode } from "@sina-design-system/fintech";

export function formatAmount(minor: number, currency: string): string {
  const exponent = MINOR_UNIT_EXPONENT[currency as CurrencyCode] ?? 2;
  const major = minor / 10 ** exponent;
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(major);
  } catch {
    return `${major.toLocaleString("en-US")} ${currency}`;
  }
}

/** Stable, pretty JSON for the CodeBlock. */
export function pretty(value: unknown): string {
  return JSON.stringify(value, null, 2);
}
