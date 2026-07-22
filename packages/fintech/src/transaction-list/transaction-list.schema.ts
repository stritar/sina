/**
 * The transaction-list constitution — an UNGOVERNED display pattern.
 *
 * "Show me my last N transactions" carries no money-movement or compliance risk,
 * so this rule has **no policy and no escalations**: it validates SHAPE only and
 * mounts the presentational `TransactionList`. Validate-then-mount still holds —
 * a read is shape-checked (integer minor-unit amounts, ISO timestamps, bounded
 * strings), `.strict()` (top-level and per-row) turns away a fabricated row
 * action, and the array is bounded so a hostile stream cannot flood the client.
 *
 * Boundary: SINA guarantees the payload's SHAPE and provenance, **not** that the
 * data is true or its free-text safe. Apps must source `props` from trusted tools
 * (not model free-text), and the component renders text, never raw HTML.
 */

import { z } from "zod";
import type { RedactionConfig } from "@sina-design-system/governance";

import { minorUnitAmount } from "../formats/amount.js";
import { currencyCode } from "../formats/currency.js";
import { maskedAccountRef } from "../formats/masked-account.js";

/** One posted transaction. `.strict()` turns away a smuggled row action (e.g. a fabricated pay button). */
const transaction = z
  .object({
    id: z.string().min(1).max(64),
    postedAt: z.string().datetime({ message: "postedAt must be an ISO-8601 timestamp" }),
    description: z.string().min(1).max(140),
    counterparty: z.string().min(1).max(140),
    amount: minorUnitAmount,
    currency: currencyCode,
    direction: z.enum(["debit", "credit"]),
  })
  .strict();

export const transactionListPayload = z
  .object({
    account: maskedAccountRef,
    transactions: z.array(transaction).max(200, "too many transactions in one view (max 200)"),
  })
  .strict();

export type Transaction = z.infer<typeof transaction>;
export type TransactionListPayload = z.infer<typeof transactionListPayload>;

export const TRANSACTION_LIST_VERSION = "1.0.0";

/** Re-mask the (already-masked) account number before it reaches the audit trail. */
export const TRANSACTION_LIST_REDACTION: RedactionConfig = { mask: ["maskedNumber"] };
