/**
 * The ACH-transfer constitution — a governed money-movement flow (Phase 6, §A).
 *
 * The generalized twin of the flagship wire schema: it reuses the shared
 * {@link stepUpApproval} / {@link stepUpViolations} dual-control mechanism instead
 * of authoring its own, so above the SINA authorization threshold an un-authorized
 * ACH escalates to the `GovernedActionDialog`, and an authorization-bearing
 * re-submission is bound to the exact terms (four-eyes + payload binding). A
 * same-day entry above the Nacha per-payment limit is a hard reject.
 *
 * `.strict()` turns away a fabricated "Confirm" button or smuggled card data.
 */

import { z } from "zod";
import {
  intercept,
  type InterceptionResult,
  type RedactionConfig,
  type Violation,
} from "@sina-design-system/governance";

import { minorUnitAmount } from "../formats/amount.js";
import { currencyCode } from "../formats/currency.js";
import { abaRouting } from "../formats/routing.js";
import { PROHIBITED_CARD_FIELDS } from "../formats/card.js";
import {
  ACTION_INITIATOR_ID,
  stepUpApproval,
  stepUpViolations,
  type ActionContext,
} from "../formats/step-up.js";
import { usdScopeFlag } from "../formats/usd-scope.js";
import {
  ACH_AUTHORIZATION_MINOR,
  ACH_MAX_MINOR,
  ACH_SAMEDAY_MAX_MINOR,
  CTR_MINOR,
  STRIPE_MIN_MINOR,
} from "../thresholds.js";

/** The receiving party on an ACH entry. */
const counterparty = z
  .object({
    name: z.string().min(1, "counterparty name is required"),
    routingNumber: abaRouting,
    accountNumber: z.string().regex(/^\d{4,17}$/, "account number must be 4–17 digits"),
  })
  .strict();

const achTransferBase = z
  .object({
    amount: minorUnitAmount
      .min(STRIPE_MIN_MINOR, "amount below the minimum charge")
      // Not the card ceiling: it sits below Nacha's same-day limit, which would
      // make that limit unreachable. See ACH_MAX_MINOR.
      .max(ACH_MAX_MINOR, "amount exceeds the maximum ACH entry"),
    currency: currencyCode,
    counterparty,
    /** Same Day ACH settlement — carries the Nacha per-payment ceiling. */
    sameDay: z.boolean().optional(),
    reference: z.string().max(140, "reference exceeds 140 chars").optional(),
  })
  .strict();

/** The ACH payload plus the optional shared step-up envelope. */
export const achTransferPayload = achTransferBase
  .extend({ stepUp: stepUpApproval.optional() })
  .strict();

export type AchTransferPayload = z.infer<typeof achTransferPayload>;

export const ACH_TRANSFER_VERSION = "1.1.0";

/** Never store prohibited card data; keep raw account identifiers out of the audit log. */
export const ACH_TRANSFER_REDACTION: RedactionConfig = {
  drop: [...PROHIBITED_CARD_FIELDS, "secondFactor"],
  hash: ["accountNumber", "routingNumber", "approverId"],
};

/**
 * Post-parse policy, curried over the server-supplied {@link ActionContext}. USD
 * bands only (FX equivalence is out of scope — matches the wire schema); a
 * non-USD pass carries a `POLICY_BANDS_NOT_EVALUATED` flag, never a silent skip.
 */
export function makeAchPolicy(ctx: ActionContext) {
  return function achPolicy(data: AchTransferPayload): Violation[] {
    const violations: Violation[] = [];
    if (data.currency !== "USD") {
      violations.push(usdScopeFlag(data.currency));
      return violations;
    }

    const { amount } = data;

    // Nacha caps a Same Day ACH entry per payment; over it the rail cannot carry
    // the entry at all, so this is a hard reject, not an escalation.
    if (data.sameDay === true && amount > ACH_SAMEDAY_MAX_MINOR) {
      violations.push({
        code: "ACH_SAMEDAY_LIMIT_EXCEEDED",
        message: "same-day ACH entry above the $1,000,000 Nacha per-payment limit",
        standard: "Nacha Operating Rules — Same Day ACH per-payment limit",
        severity: "reject",
      });
    }

    if (amount > CTR_MINOR) {
      violations.push({
        code: "CTR_REPORTABLE",
        message: "currency transaction > $10,000 — Currency Transaction Report applies",
        standard: "31 CFR 1010.311",
        severity: "flag",
      });
    }

    if (amount > ACH_AUTHORIZATION_MINOR) {
      violations.push(
        ...stepUpViolations(data, ctx, {
          mode: "approval",
          code: "ACH_LIMIT_EXCEEDED",
          message: "ACH transfer above $25,000 requires authorization",
          standard: "SINA dual-control — ACH authorization",
        }),
      );
    }

    return violations;
  };
}

/**
 * Evaluate an ACH-transfer intent against the constitution (server-side gate +
 * audit). Handles the initial intent (no step-up → escalate) and an
 * authorization-bearing re-submission (bind + separation-of-duties → pass or
 * reject). `ctx.initiatorId` is server-known, never from the payload.
 */
export function evaluateAchTransfer(
  payload: unknown,
  ctx: ActionContext = { initiatorId: ACTION_INITIATOR_ID },
): InterceptionResult {
  return intercept(
    {
      schema: achTransferPayload,
      policy: makeAchPolicy(ctx),
      escalations: { ACH_LIMIT_EXCEEDED: "GovernedActionDialog" },
      redaction: ACH_TRANSFER_REDACTION,
      version: ACH_TRANSFER_VERSION,
    },
    payload,
  );
}
