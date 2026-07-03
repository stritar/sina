/**
 * The FX-conversion constitution — a governed money-movement flow (Phase 6).
 *
 * A sibling of the ACH schema: it reuses the shared {@link stepUpApproval} /
 * {@link stepUpViolations} dual-control mechanism instead of authoring its own, so
 * a USD conversion above the SINA FX authorization threshold escalates to the
 * `GovernedActionDialog`, and an authorization-bearing re-submission is bound to
 * the exact terms (four-eyes + payload binding).
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
import { FX_AUTHORIZATION_MINOR, STRIPE_MAX_MINOR, STRIPE_MIN_MINOR } from "../thresholds.js";

const base = z
  .object({
    amount: minorUnitAmount
      .min(STRIPE_MIN_MINOR, "amount below the minimum charge")
      .max(STRIPE_MAX_MINOR, "amount exceeds the maximum charge"),
    currency: currencyCode,
    toCurrency: currencyCode,
    rate: z.number().positive("conversion rate must be positive"),
    spreadBps: z.number().int().nonnegative().optional(),
  })
  .strict();

/** The FX-convert payload plus the optional shared step-up envelope. */
export const fxConvertPayload = base.extend({ stepUp: stepUpApproval.optional() }).strict();

export type FxConvertPayload = z.infer<typeof fxConvertPayload>;

export const FX_CONVERT_VERSION = "1.0.0";

/** Never store prohibited card data; keep the approver identity out of the audit log. */
export const FX_CONVERT_REDACTION: RedactionConfig = {
  drop: [...PROHIBITED_CARD_FIELDS, "secondFactor"],
  hash: ["approverId"],
};

/**
 * Post-parse policy, curried over the server-supplied {@link ActionContext}. USD
 * bands only (FX equivalence of the *source* leg is deferred, by design — matches
 * the wire schema). Above the SINA FX authorization threshold an un-authorized
 * conversion escalates; an authorization-bearing one is bound to the exact terms.
 */
export function makeFxConvertPolicy(ctx: ActionContext) {
  return function fxConvertPolicy(data: FxConvertPayload): Violation[] {
    const violations: Violation[] = [];
    if (data.currency !== "USD") return violations;

    const { amount } = data;

    if (amount > FX_AUTHORIZATION_MINOR) {
      violations.push(
        ...stepUpViolations(data, ctx, {
          mode: "approval",
          code: "FX_LIMIT_EXCEEDED",
          message: "FX conversion above $10,000 requires authorization",
          standard: "SINA dual-control — FX authorization",
        }),
      );
    }

    return violations;
  };
}

/**
 * Evaluate an FX-conversion intent against the constitution (server-side gate +
 * audit). Handles the initial intent (no step-up → escalate) and an
 * authorization-bearing re-submission (bind + separation-of-duties → pass or
 * reject). `ctx.initiatorId` is server-known, never from the payload.
 */
export function evaluateFxConvert(
  payload: unknown,
  ctx: ActionContext = { initiatorId: ACTION_INITIATOR_ID },
): InterceptionResult {
  return intercept(
    {
      schema: fxConvertPayload,
      policy: makeFxConvertPolicy(ctx),
      escalations: { FX_LIMIT_EXCEEDED: "GovernedActionDialog" },
      redaction: FX_CONVERT_REDACTION,
      version: FX_CONVERT_VERSION,
    },
    payload,
  );
}
