/**
 * The change-limit constitution — a governed spending-limit flow (Phase 6).
 *
 * Raising a card / ATM / transfer spending limit above the SINA authorization
 * threshold is a dual-control action: it reuses the shared
 * {@link stepUpApproval} / {@link stepUpViolations} mechanism instead of
 * authoring its own, so an un-authorized raise escalates to the
 * `GovernedActionDialog`, and an authorization-bearing re-submission is bound to
 * the exact new-limit terms (four-eyes + payload binding).
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
import { PROHIBITED_CARD_FIELDS } from "../formats/card.js";
import {
  ACTION_INITIATOR_ID,
  stepUpApproval,
  stepUpViolations,
  type ActionContext,
} from "../formats/step-up.js";
import { usdScopeFlag } from "../formats/usd-scope.js";
import {
  LIMIT_CHANGE_AUTHORIZATION_MINOR,
  STRIPE_MAX_MINOR,
  STRIPE_MIN_MINOR,
} from "../thresholds.js";

const changeLimitBase = z
  .object({
    /** The *new* spending limit being requested (integer minor units). */
    amount: minorUnitAmount
      .min(STRIPE_MIN_MINOR, "new limit below the minimum")
      .max(STRIPE_MAX_MINOR, "new limit exceeds the maximum"),
    currency: currencyCode,
    limitType: z.enum(["daily_atm", "daily_card", "transfer"]),
  })
  .strict();

/** The change-limit payload plus the optional shared step-up envelope. */
export const changeLimitPayload = changeLimitBase
  .extend({ stepUp: stepUpApproval.optional() })
  .strict();

export type ChangeLimitPayload = z.infer<typeof changeLimitPayload>;

export const CHANGE_LIMIT_VERSION = "1.1.0";

/** Never store prohibited card data; keep the approver identity out of the audit log in the clear. */
export const CHANGE_LIMIT_REDACTION: RedactionConfig = {
  drop: [...PROHIBITED_CARD_FIELDS, "secondFactor"],
  hash: ["approverId"],
};

/**
 * Post-parse policy, curried over the server-supplied {@link ActionContext}. USD
 * bands only (FX equivalence is out of scope — matches the wire schema); a non-USD
 * pass carries a `POLICY_BANDS_NOT_EVALUATED` flag, never a silent skip. A
 * new limit above the authorization threshold demands a second approver.
 */
export function makeChangeLimitPolicy(ctx: ActionContext) {
  return function changeLimitPolicy(data: ChangeLimitPayload): Violation[] {
    const violations: Violation[] = [];
    if (data.currency !== "USD") {
      violations.push(usdScopeFlag(data.currency));
      return violations;
    }

    const newLimit = data.amount;

    if (newLimit > LIMIT_CHANGE_AUTHORIZATION_MINOR) {
      violations.push(
        ...stepUpViolations(data, ctx, {
          mode: "approval",
          code: "LIMIT_CHANGE_REQUIRES_APPROVAL",
          message: "raising a spending limit above $10,000 requires approval",
          standard: "SINA dual-control — limit change",
        }),
      );
    }

    return violations;
  };
}

/**
 * Evaluate a change-limit intent against the constitution (server-side gate +
 * audit). Handles the initial intent (no step-up → escalate) and an
 * authorization-bearing re-submission (bind + separation-of-duties → pass or
 * reject). `ctx.initiatorId` is server-known, never from the payload.
 */
export function evaluateChangeLimit(
  payload: unknown,
  ctx: ActionContext = { initiatorId: ACTION_INITIATOR_ID },
): InterceptionResult {
  return intercept(
    {
      schema: changeLimitPayload,
      policy: makeChangeLimitPolicy(ctx),
      escalations: { LIMIT_CHANGE_REQUIRES_APPROVAL: "GovernedActionDialog" },
      redaction: CHANGE_LIMIT_REDACTION,
      version: CHANGE_LIMIT_VERSION,
    },
    payload,
  );
}
