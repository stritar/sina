/**
 * The statement-list constitution — an UNGOVERNED display pattern.
 *
 * Account statement periods for display: each a period range plus its closing
 * balance (integer minor units, may be negative). Shape-only, `.strict()` per
 * statement, bounded. Mounts the presentational `StatementList`. The account's
 * masked number is additionally `mask`-redacted.
 */

import { z } from "zod";
import type { RedactionConfig } from "@sina-design-system/governance";

import { currencyCode } from "../formats/currency.js";
import { maskedAccountRef } from "../formats/masked-account.js";

const statement = z
  .object({
    id: z.string().min(1).max(40),
    periodStart: z.string().datetime(),
    periodEnd: z.string().datetime(),
    closingBalance: z.number().int(),
    currency: currencyCode,
    documentRef: z.string().min(1).max(80).optional(),
  })
  .strict();

export const statementListPayload = z
  .object({
    account: maskedAccountRef,
    statements: z.array(statement).max(60, "too many statements (max 60)"),
  })
  .strict();

export type StatementListPayload = z.infer<typeof statementListPayload>;

export const STATEMENT_LIST_VERSION = "1.0.0";

export const STATEMENT_LIST_REDACTION: RedactionConfig = { mask: ["maskedNumber"] };
