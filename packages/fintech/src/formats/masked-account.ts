/**
 * A masked account reference for read/display patterns.
 *
 * A human label plus a masked number — never a full account number or PAN. Read
 * patterns (TransactionList, BalanceCard, …) reuse this; the `maskedNumber` field
 * name is additionally on each read's audit `mask` redaction list, so even the
 * masked tail is re-masked before it reaches the audit trail.
 */

import { z } from "zod";

/** A masked number like `****1234` — ≥2 stars, then 2–4 digits. Never a full account/PAN. */
export const maskedNumber = z
  .string()
  .regex(/^\*{2,}\d{2,4}$/, "account number must be masked (e.g. ****1234)");

/** `label` + a masked number. */
export const maskedAccountRef = z
  .object({
    label: z.string().min(1).max(80),
    maskedNumber,
  })
  .strict();

export type MaskedAccountRef = z.infer<typeof maskedAccountRef>;
