/**
 * The cash-withdrawal constitution — a governed money-movement flow (Phase 6).
 *
 * It reuses the shared {@link stepUpApproval} / {@link stepUpViolations}
 * dual-control mechanism instead of authoring its own: a cash withdrawal above
 * the SINA authorization threshold escalates to the `GovernedActionDialog`, and
 * an authorization-bearing re-submission is bound to the exact terms (four-eyes +
 * payload binding). A withdrawal over the CTR ceiling is additionally flagged as
 * reportable.
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
import { maskedAccountRef } from "../formats/masked-account.js";
import { PROHIBITED_CARD_FIELDS } from "../formats/card.js";
import {
  ACTION_INITIATOR_ID,
  stepUpApproval,
  stepUpViolations,
  type ActionContext,
} from "../formats/step-up.js";
import { usdScopeFlag } from "../formats/usd-scope.js";
import {
  CTR_MINOR,
  STRIPE_MAX_MINOR,
  STRIPE_MIN_MINOR,
  WITHDRAWAL_AUTHORIZATION_MINOR,
} from "../thresholds.js";

const base = z
  .object({
    amount: minorUnitAmount
      .min(STRIPE_MIN_MINOR, "amount below the minimum charge")
      .max(STRIPE_MAX_MINOR, "amount exceeds the maximum charge"),
    currency: currencyCode,
    method: z.enum(["atm", "branch", "check"]),
    account: maskedAccountRef,
  })
  .strict();

/** The withdrawal payload plus the optional shared step-up envelope. */
export const withdrawPayload = base.extend({ stepUp: stepUpApproval.optional() }).strict();

export type WithdrawPayload = z.infer<typeof withdrawPayload>;

export const WITHDRAW_VERSION = "1.1.0";

/** Never store prohibited card data; keep the approver + masked tail out of the audit log. */
export const WITHDRAW_REDACTION: RedactionConfig = {
  mask: ["maskedNumber"],
  hash: ["approverId"],
  drop: [...PROHIBITED_CARD_FIELDS, "secondFactor"],
};

/**
 * Post-parse policy, curried over the server-supplied {@link ActionContext}. USD
 * bands only (FX equivalence is out of scope — matches the wire schema); a
 * non-USD pass carries a `POLICY_BANDS_NOT_EVALUATED` flag, never a silent skip.
 */
export function makeWithdrawPolicy(ctx: ActionContext) {
  return function withdrawPolicy(data: WithdrawPayload): Violation[] {
    const violations: Violation[] = [];
    if (data.currency !== "USD") {
      violations.push(usdScopeFlag(data.currency));
      return violations;
    }

    const { amount } = data;

    if (amount > CTR_MINOR) {
      violations.push({
        code: "CTR_REPORTABLE",
        message: "currency transaction > $10,000 — Currency Transaction Report applies",
        standard: "31 CFR 1010.311",
        severity: "flag",
      });
    }

    if (amount > WITHDRAWAL_AUTHORIZATION_MINOR) {
      violations.push(
        ...stepUpViolations(data, ctx, {
          mode: "approval",
          code: "WITHDRAWAL_LIMIT",
          message: "cash withdrawal above $10,000 requires authorization",
          standard: "SINA dual-control — withdrawal authorization",
        }),
      );
    }

    return violations;
  };
}

/**
 * Evaluate a cash-withdrawal intent against the constitution (server-side gate +
 * audit). Handles the initial intent (no step-up → escalate) and an
 * authorization-bearing re-submission (bind + separation-of-duties → pass or
 * reject). `ctx.initiatorId` is server-known, never from the payload.
 */
export function evaluateWithdraw(
  payload: unknown,
  ctx: ActionContext = { initiatorId: ACTION_INITIATOR_ID },
): InterceptionResult {
  return intercept(
    {
      schema: withdrawPayload,
      policy: makeWithdrawPolicy(ctx),
      escalations: { WITHDRAWAL_LIMIT: "GovernedActionDialog" },
      redaction: WITHDRAW_REDACTION,
      version: WITHDRAW_VERSION,
    },
    payload,
  );
}
