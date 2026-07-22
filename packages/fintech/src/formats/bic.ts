/**
 * BIC / SWIFT code (ISO 9362).
 *
 * 4-letter bank code + 2-letter country (ISO 3166-1) + 2 location chars, plus an
 * optional 3-char branch — so 8 or 11 characters total.
 *
 * @see ISO 9362:2022
 */

import { z } from "zod";

const BIC_REGEX = /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/;

/** True if `value` is a structurally valid BIC (8 or 11 chars). */
export function isValidBic(value: string): boolean {
  return BIC_REGEX.test(value);
}

export const bic = z.string().refine(isValidBic, {
  message: "invalid BIC/SWIFT code — ISO 9362 (8 or 11 characters)",
});
