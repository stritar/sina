/**
 * US ABA routing number — 9 digits with the 3-7-1 weighted mod-10 checksum.
 *
 * Sum each digit times its weight (positions cycle 3,7,1); the total mod 10 must
 * be 0. Example: 325081403 → 100 → valid.
 *
 * @see ABA routing transit number (MICR) · Apache Commons `ABANumberCheckDigit`
 */

import { z } from "zod";

/** True if `value` is 9 digits and passes the ABA 3-7-1 mod-10 checksum. */
export function isValidAbaRouting(value: string): boolean {
  if (!/^\d{9}$/.test(value)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i += 1) {
    const weight = i % 3 === 0 ? 3 : i % 3 === 1 ? 7 : 1;
    sum += (value.charCodeAt(i) - 48) * weight;
  }
  return sum % 10 === 0;
}

export const abaRouting = z.string().refine(isValidAbaRouting, {
  message: "invalid ABA routing number — 3-7-1 weighted mod-10 checksum failed",
});
