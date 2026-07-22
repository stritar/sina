/**
 * The account-list constitution — an UNGOVERNED display pattern.
 *
 * A customer's accounts for display: name, type, a **masked** account reference
 * (never a full number), a signed integer balance, currency. Shape-only,
 * `.strict()` per account, bounded. Mounts the presentational `AccountList`. The
 * masked number is additionally `mask`-redacted before it reaches the audit trail.
 */

import { z } from "zod";
import type { RedactionConfig } from "@sina-design-system/governance";

import { currencyCode } from "../formats/currency.js";
import { maskedAccountRef } from "../formats/masked-account.js";

const account = z
  .object({
    id: z.string().min(1).max(40),
    name: z.string().min(1).max(80),
    type: z.enum(["checking", "savings", "credit", "loan", "investment"]),
    account: maskedAccountRef,
    balance: z.number().int(),
    currency: currencyCode,
  })
  .strict();

export const accountListPayload = z
  .object({
    accounts: z.array(account).max(50, "too many accounts (max 50)"),
  })
  .strict();

export type AccountListPayload = z.infer<typeof accountListPayload>;

export const ACCOUNT_LIST_VERSION = "1.0.0";

export const ACCOUNT_LIST_REDACTION: RedactionConfig = { mask: ["maskedNumber"] };
