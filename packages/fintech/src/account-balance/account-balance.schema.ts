/**
 * The account-balance constitution — an UNGOVERNED display pattern.
 *
 * "What's my balance?" is a pure read: no policy, no escalation. Shape-only
 * validation (integer minor-unit balances, a masked account, `.strict()`) then
 * mounts the presentational `BalanceCard`. Same boundary as the transaction list:
 * SINA validates shape + provenance, not truthfulness; source `props` from tools.
 */

import { z } from "zod";
import type { RedactionConfig } from "@sina-design-system/governance";

import { minorUnitAmount } from "../formats/amount.js";
import { currencyCode } from "../formats/currency.js";
import { maskedAccountRef } from "../formats/masked-account.js";

export const accountBalancePayload = z
  .object({
    account: maskedAccountRef,
    available: minorUnitAmount,
    current: minorUnitAmount,
    currency: currencyCode,
  })
  .strict();

export type AccountBalancePayload = z.infer<typeof accountBalancePayload>;

export const ACCOUNT_BALANCE_VERSION = "1.0.0";

export const ACCOUNT_BALANCE_REDACTION: RedactionConfig = { mask: ["maskedNumber"] };
