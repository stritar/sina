/**
 * Card primitives — the Luhn (ISO/IEC 7812) checksum and the PCI-DSS list of
 * data that must never be stored.
 *
 * The full card-payment constitution is deferred (Phase 3 scope = wire transfer
 * only); these are reusable primitives. `PROHIBITED_CARD_FIELDS` feeds the audit
 * redaction drop-list so prohibited data can never reach a log — and a closed
 * (`.strict()`) schema rejects any payload that carries it.
 *
 * @see ISO/IEC 7812-1 (Luhn)
 * @see PCI-DSS v4.0 Req 3.3.1 (sensitive authentication data must not be stored)
 */

import { z } from "zod";

/** True if `value` is 13–19 digits and passes the Luhn checksum. */
export function isValidLuhn(value: string): boolean {
  if (!/^\d{13,19}$/.test(value)) return false;
  let sum = 0;
  let double = false;
  for (let i = value.length - 1; i >= 0; i -= 1) {
    let digit = value.charCodeAt(i) - 48;
    if (double) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    double = !double;
  }
  return sum % 10 === 0;
}

/** A Primary Account Number: 13–19 digits passing Luhn. */
export const pan = z.string().refine(isValidLuhn, {
  message: "invalid PAN — fails Luhn checksum (ISO/IEC 7812)",
});

/**
 * Sensitive authentication data PCI-DSS forbids storing in any form. Used as the
 * audit redaction drop-list; a closed payload schema rejects these outright.
 */
export const PROHIBITED_CARD_FIELDS = [
  "cvv",
  "cvv2",
  "cvc2",
  "cav2",
  "cid",
  "pin",
  "pinblock",
  "track",
  "track1",
  "track2",
] as const;
