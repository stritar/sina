/**
 * The transaction-detail constitution — an UNGOVERNED display pattern.
 *
 * A single posted transaction for display: description, counterparty, amount,
 * direction, status, and a **masked** account reference (never a full number).
 * Shape-only, `.strict()`, bounded; amount is integer minor units. Mounts the
 * presentational `TransactionDetail`. The masked account number is additionally
 * `mask`-redacted before it reaches the audit trail.
 */

import { z } from "zod";
import type { RedactionConfig } from "@sina-design-system/governance";

import { minorUnitAmount } from "../formats/amount.js";
import { currencyCode } from "../formats/currency.js";
import { maskedAccountRef } from "../formats/masked-account.js";

export const transactionDetailPayload = z
  .object({
    id: z.string().min(1).max(40),
    postedAt: z.string().datetime(),
    description: z.string().min(1).max(140),
    counterparty: z.string().min(1).max(80),
    amount: minorUnitAmount,
    currency: currencyCode,
    direction: z.enum(["debit", "credit"]),
    status: z.enum(["posted", "pending"]),
    category: z.string().min(1).max(40).optional(),
    account: maskedAccountRef,
    memo: z.string().min(1).max(280).optional(),
  })
  .strict();

export type TransactionDetailPayload = z.infer<typeof transactionDetailPayload>;

export const TRANSACTION_DETAIL_VERSION = "1.0.0";

export const TRANSACTION_DETAIL_REDACTION: RedactionConfig = { mask: ["maskedNumber"] };
