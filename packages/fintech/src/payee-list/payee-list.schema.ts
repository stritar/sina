/**
 * The payee-list constitution — an UNGOVERNED display pattern.
 *
 * Saved payees for display: name, **masked** number, verified flag, last-paid
 * date. Shape-only, `.strict()` per payee, bounded. Mounts the presentational
 * `PayeeList`. Adding/verifying a payee is a *governed* flow (out of scope here).
 */

import { z } from "zod";
import type { RedactionConfig } from "@sina-design-system/governance";

import { maskedNumber } from "../formats/masked-account.js";

const payee = z
  .object({
    id: z.string().min(1).max(64),
    name: z.string().min(1).max(140),
    maskedNumber,
    verified: z.boolean(),
    lastPaidAt: z.string().datetime({ message: "lastPaidAt must be an ISO-8601 timestamp" }).optional(),
  })
  .strict();

export const payeeListPayload = z
  .object({
    payees: z.array(payee).max(100, "too many payees (max 100)"),
  })
  .strict();

export type PayeeListPayload = z.infer<typeof payeeListPayload>;

export const PAYEE_LIST_VERSION = "1.0.0";

export const PAYEE_LIST_REDACTION: RedactionConfig = { mask: ["maskedNumber"] };
