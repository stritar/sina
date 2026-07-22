/**
 * The recurring-setup constitution — a governed money-movement flow (Phase 6).
 *
 * A standing order (recurring payment) the model wants to establish: a per-cycle
 * amount, a cadence, a payee, and a start (optionally an end). It reuses the
 * shared {@link stepUpApproval} / {@link stepUpViolations} dual-control mechanism
 * instead of authoring its own — above the SINA per-cycle standing-order cap an
 * un-authorized setup escalates to the `GovernedActionDialog`, and an
 * authorization-bearing re-submission is bound to the exact terms (four-eyes +
 * payload binding).
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
import { RECURRING_CYCLE_CAP_MINOR, STRIPE_MAX_MINOR, STRIPE_MIN_MINOR } from "../thresholds.js";

const recurringSetupBase = z
  .object({
    amount: minorUnitAmount
      .min(STRIPE_MIN_MINOR, "amount below the minimum charge")
      .max(STRIPE_MAX_MINOR, "amount exceeds the maximum charge"),
    currency: currencyCode,
    cadence: z.enum(["weekly", "monthly", "quarterly", "yearly"]),
    payee: z
      .object({ name: z.string().min(1, "payee name is required").max(80, "payee name too long") })
      .strict(),
    startAt: z.string().datetime(),
    endAt: z.string().datetime().optional(),
  })
  .strict();

/** The recurring-setup payload plus the optional shared step-up envelope. */
export const recurringSetupPayload = recurringSetupBase
  .extend({ stepUp: stepUpApproval.optional() })
  .strict();

export type RecurringSetupPayload = z.infer<typeof recurringSetupPayload>;

export const RECURRING_SETUP_VERSION = "1.1.0";

/** Never store prohibited card data; keep the approver identity out of the audit log in the clear. */
export const RECURRING_SETUP_REDACTION: RedactionConfig = {
  drop: [...PROHIBITED_CARD_FIELDS, "secondFactor"],
  hash: ["approverId"],
};

/**
 * Post-parse policy, curried over the server-supplied {@link ActionContext}. USD
 * bands only (FX equivalence is out of scope — matches the sibling schemas); a
 * non-USD pass carries a `POLICY_BANDS_NOT_EVALUATED` flag, never a silent skip.
 * A per-cycle amount above the standing-order cap requires authorization.
 */
export function makeRecurringSetupPolicy(ctx: ActionContext) {
  return function recurringSetupPolicy(data: RecurringSetupPayload): Violation[] {
    const violations: Violation[] = [];
    if (data.currency !== "USD") {
      violations.push(usdScopeFlag(data.currency));
      return violations;
    }

    const { amount } = data;

    if (amount > RECURRING_CYCLE_CAP_MINOR) {
      violations.push(
        ...stepUpViolations(data, ctx, {
          mode: "approval",
          code: "RECURRING_CAP_EXCEEDED",
          message: "recurring per-cycle amount above the standing-order cap requires authorization",
          standard: "SINA dual-control — standing-order cap",
        }),
      );
    }

    return violations;
  };
}

/**
 * Evaluate a recurring-setup intent against the constitution (server-side gate +
 * audit). Handles the initial intent (no step-up → escalate) and an
 * authorization-bearing re-submission (bind + separation-of-duties → pass or
 * reject). `ctx.initiatorId` is server-known, never from the payload.
 */
export function evaluateRecurringSetup(
  payload: unknown,
  ctx: ActionContext = { initiatorId: ACTION_INITIATOR_ID },
): InterceptionResult {
  return intercept(
    {
      schema: recurringSetupPayload,
      policy: makeRecurringSetupPolicy(ctx),
      escalations: { RECURRING_CAP_EXCEEDED: "GovernedActionDialog" },
      redaction: RECURRING_SETUP_REDACTION,
      version: RECURRING_SETUP_VERSION,
    },
    payload,
  );
}
