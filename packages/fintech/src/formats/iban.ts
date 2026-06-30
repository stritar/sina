/**
 * IBAN (ISO 13616) with the mod-97 (ISO 7064) checksum.
 *
 * Structure: 2-letter country (ISO 3166-1) + 2 check digits + BBAN, ≤34 chars.
 * Validity is the mod-97 test: move the first 4 chars to the end, map A–Z → 10–35,
 * and the resulting integer mod 97 must equal 1.
 *
 * @see ISO 13616 · https://www.iban.com/structure
 * @see ISO 7064 (mod-97-10)
 */

import { z } from "zod";

const IBAN_REGEX = /^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$/;

/** True if `value` is a structurally valid IBAN that passes the mod-97 checksum. */
export function isValidIban(value: string): boolean {
  const normalized = value.replace(/\s+/g, "").toUpperCase();
  if (normalized.length > 34 || !IBAN_REGEX.test(normalized)) return false;

  const rearranged = normalized.slice(4) + normalized.slice(0, 4);
  let remainder = 0;
  for (const char of rearranged) {
    const mapped = char >= "A" && char <= "Z" ? (char.charCodeAt(0) - 55).toString() : char;
    for (const digit of mapped) {
      remainder = (remainder * 10 + (digit.charCodeAt(0) - 48)) % 97;
    }
  }
  return remainder === 1;
}

export const iban = z.string().refine(isValidIban, {
  message: "invalid IBAN — ISO 13616 / mod-97 (ISO 7064) checksum failed",
});
