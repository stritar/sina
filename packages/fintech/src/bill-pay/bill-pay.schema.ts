/**
 * The bill-pay constitution — a governed payments flow (Phase 6).
 *
 * A scheduled or on-demand payment to a known payee. It reuses the shared
 * {@link stepUpApproval} / {@link stepUpViolations} dual-control mechanism rather
 * than authoring its own: above the SINA bill-pay authorization threshold an
 * un-authorized payment escalates to the `GovernedActionDialog` (approval mode),
 * and an authorization-bearing re-submission is bound to the exact terms
 * (four-eyes + payload binding). `.strict()` turns away a fabricated "Confirm"
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
import { maskedNumber } from "../formats/masked-account.js";
import { PROHIBITED_CARD_FIELDS } from "../formats/card.js";
import {
  ACTION_INITIATOR_ID,
  stepUpApproval,
  stepUpViolations,
  type ActionContext,
} from "../formats/step-up.js";
import {
  BILLPAY_AUTHORIZATION_MINOR,
  CTR_MINOR,
  STRIPE_MAX_MINOR,
  STRIPE_MIN_MINOR,
} from "../thresholds.js";

/** The payee a bill payment is directed to — a masked reference, never a full account number. */
const payee = z
  .object({
    id: z.string().min(1).max(40),
    name: z.string().min(1).max(80),
    maskedNumber,
  })
  .strict();

const billPayBase = z
  .object({
    amount: minorUnitAmount
      .min(STRIPE_MIN_MINOR, "amount below the minimum charge")
      .max(STRIPE_MAX_MINOR, "amount exceeds the maximum charge"),
    currency: currencyCode,
    payee,
    dueAt: z.string().datetime().optional(),
  })
  .strict();

/** The bill-pay payload plus the optional shared step-up envelope. */
export const billPayPayload = billPayBase.extend({ stepUp: stepUpApproval.optional() }).strict();

export type BillPayPayload = z.infer<typeof billPayPayload>;

export const BILL_PAY_VERSION = "1.0.0";

/** Never store prohibited card data; keep the masked payee tail + approver identity out of the log. */
export const BILL_PAY_REDACTION: RedactionConfig = {
  drop: [...PROHIBITED_CARD_FIELDS, "secondFactor"],
  mask: ["maskedNumber"],
  hash: ["approverId"],
};

/**
 * Post-parse policy, curried over the server-supplied {@link ActionContext}. USD
 * bands only (FX equivalence deferred, by design — matches the wire/ACH schemas).
 */
export function makeBillPayPolicy(ctx: ActionContext) {
  return function billPayPolicy(data: BillPayPayload): Violation[] {
    const violations: Violation[] = [];
    if (data.currency !== "USD") return violations;

    const { amount } = data;

    if (amount > CTR_MINOR) {
      violations.push({
        code: "CTR_REPORTABLE",
        message: "currency transaction > $10,000 — Currency Transaction Report applies",
        standard: "31 CFR 1010.311",
        severity: "flag",
      });
    }

    if (amount > BILLPAY_AUTHORIZATION_MINOR) {
      violations.push(
        ...stepUpViolations(data, ctx, {
          mode: "approval",
          code: "BILLPAY_LIMIT_EXCEEDED",
          message: "bill payment above $10,000 requires authorization",
          standard: "SINA dual-control — bill-pay authorization",
        }),
      );
    }

    return violations;
  };
}

/**
 * Evaluate a bill-pay intent against the constitution (server-side gate + audit).
 * Handles the initial intent (no step-up → escalate) and an authorization-bearing
 * re-submission (bind + separation-of-duties → pass or reject). `ctx.initiatorId`
 * is server-known, never from the payload.
 */
export function evaluateBillPay(
  payload: unknown,
  ctx: ActionContext = { initiatorId: ACTION_INITIATOR_ID },
): InterceptionResult {
  return intercept(
    {
      schema: billPayPayload,
      policy: makeBillPayPolicy(ctx),
      escalations: { BILLPAY_LIMIT_EXCEEDED: "GovernedActionDialog" },
      redaction: BILL_PAY_REDACTION,
      version: BILL_PAY_VERSION,
    },
    payload,
  );
}
