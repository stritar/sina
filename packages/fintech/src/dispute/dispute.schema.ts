/**
 * The dispute constitution — a governed dispute-resolution flow (Phase 6).
 *
 * Filing a Reg E error-resolution dispute against a posted transaction is a
 * sensitive account action, so the constitution *unconditionally* escalates it to
 * the `GovernedActionDialog` until the actor clears it with a second-factor
 * re-authentication. It reuses the shared {@link stepUpApproval} /
 * {@link stepUpViolations} step-up mechanism (`second-factor` mode) rather than
 * authoring its own dual-control. `.strict()` turns away a fabricated "Confirm"
 * button or smuggled card data.
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
import { STRIPE_MAX_MINOR, STRIPE_MIN_MINOR } from "../thresholds.js";

const base = z
  .object({
    transactionId: z
      .string()
      .min(1, "transactionId is required")
      .max(40, "transactionId exceeds 40 chars"),
    amount: minorUnitAmount
      .min(STRIPE_MIN_MINOR, "amount below the minimum charge")
      .max(STRIPE_MAX_MINOR, "amount exceeds the maximum charge"),
    currency: currencyCode,
    reason: z.enum(["unauthorized", "duplicate", "not_received", "incorrect_amount"]),
  })
  .strict();

/** The dispute payload plus the optional shared step-up envelope. */
export const disputePayload = base.extend({ stepUp: stepUpApproval.optional() }).strict();

export type DisputePayload = z.infer<typeof disputePayload>;

export const DISPUTE_VERSION = "1.0.0";

/** Never store prohibited card data or a second factor; keep the approver out of the log. */
export const DISPUTE_REDACTION: RedactionConfig = {
  drop: [...PROHIBITED_CARD_FIELDS, "secondFactor"],
  hash: ["approverId"],
};

/**
 * Post-parse policy, curried over the server-supplied {@link ActionContext}.
 * Unconditional: filing a dispute always requires a second-factor
 * re-authentication, so an intent without a sufficient step-up escalates.
 */
export function makeDisputePolicy(ctx: ActionContext) {
  return function disputePolicy(data: DisputePayload): Violation[] {
    return stepUpViolations(data, ctx, {
      mode: "second-factor",
      code: "DISPUTE_STEP_UP",
      message: "filing a transaction dispute requires a second-factor re-authentication",
      standard: "Reg E (12 CFR 1005.11) — error resolution / SINA step-up",
    });
  };
}

/**
 * Evaluate a dispute intent against the constitution (server-side gate + audit).
 * An intent with no step-up escalates to the `GovernedActionDialog`; a
 * second-factor-bearing re-submission passes. `ctx.initiatorId` is server-known,
 * never from the payload.
 */
export function evaluateDispute(
  payload: unknown,
  ctx: ActionContext = { initiatorId: ACTION_INITIATOR_ID },
): InterceptionResult {
  return intercept(
    {
      schema: disputePayload,
      policy: makeDisputePolicy(ctx),
      escalations: { DISPUTE_STEP_UP: "GovernedActionDialog" },
      redaction: DISPUTE_REDACTION,
      version: DISPUTE_VERSION,
    },
    payload,
  );
}
