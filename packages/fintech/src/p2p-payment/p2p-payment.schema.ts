/**
 * The peer-to-peer payment constitution — a governed money-movement flow (Phase 6).
 *
 * An instant P2P send: above the SINA P2P authorization threshold an
 * un-authorized transfer escalates to the `GovernedActionDialog` in
 * second-factor mode — the actor re-authenticates with a one-time code before
 * the send proceeds. It reuses the shared {@link stepUpApproval} /
 * {@link stepUpViolations} step-up mechanism instead of authoring its own, so a
 * bare over-threshold intent escalates and a code-bearing re-submission passes.
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
  P2P_AUTHORIZATION_MINOR,
  STRIPE_MAX_MINOR,
  STRIPE_MIN_MINOR,
} from "../thresholds.js";

const p2pPaymentBase = z
  .object({
    amount: minorUnitAmount
      .min(STRIPE_MIN_MINOR, "amount below the minimum charge")
      .max(STRIPE_MAX_MINOR, "amount exceeds the maximum charge"),
    currency: currencyCode,
    recipient: z
      .object({
        handle: z.string().min(1).max(80),
        name: z.string().min(1).max(80).optional(),
      })
      .strict(),
    newRecipient: z.boolean().optional(),
    note: z.string().min(1).max(140).optional(),
  })
  .strict();

/** The P2P payment payload plus the optional shared step-up envelope. */
export const p2pPaymentPayload = p2pPaymentBase
  .extend({ stepUp: stepUpApproval.optional() })
  .strict();

export type P2pPaymentPayload = z.infer<typeof p2pPaymentPayload>;

export const P2P_PAYMENT_VERSION = "1.1.0";

/** Never store prohibited card data; keep the one-time code and approver out of the audit log. */
export const P2P_PAYMENT_REDACTION: RedactionConfig = {
  drop: [...PROHIBITED_CARD_FIELDS, "secondFactor"],
  hash: ["approverId"],
};

/**
 * Post-parse policy, curried over the server-supplied {@link ActionContext}. USD
 * bands only (FX equivalence is out of scope); a non-USD pass carries a
 * `POLICY_BANDS_NOT_EVALUATED` flag, never a silent skip. Above the P2P
 * authorization threshold ($2,500) a send requires a second factor.
 */
export function makeP2pPaymentPolicy(ctx: ActionContext) {
  return function p2pPaymentPolicy(data: P2pPaymentPayload): Violation[] {
    const violations: Violation[] = [];
    if (data.currency !== "USD") {
      violations.push(usdScopeFlag(data.currency));
      return violations;
    }

    const { amount } = data;

    if (amount > P2P_AUTHORIZATION_MINOR) {
      violations.push(
        ...stepUpViolations(data, ctx, {
          mode: "second-factor",
          code: "P2P_STEP_UP",
          message: "P2P payment above $2,500 requires a second factor",
          standard: "SINA policy — P2P step-up",
        }),
      );
    }

    return violations;
  };
}

/**
 * Evaluate a P2P-payment intent against the constitution (server-side gate +
 * audit). Handles the initial intent (no step-up → escalate) and a
 * second-factor re-submission (→ pass). `ctx.initiatorId` is server-known,
 * never from the payload.
 */
export function evaluateP2pPayment(
  payload: unknown,
  ctx: ActionContext = { initiatorId: ACTION_INITIATOR_ID },
): InterceptionResult {
  return intercept(
    {
      schema: p2pPaymentPayload,
      policy: makeP2pPaymentPolicy(ctx),
      escalations: { P2P_STEP_UP: "GovernedActionDialog" },
      redaction: P2P_PAYMENT_REDACTION,
      version: P2P_PAYMENT_VERSION,
    },
    payload,
  );
}
