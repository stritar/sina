/**
 * The credit-request constitution — a governed lending flow (Phase 6).
 *
 * A consumer credit / loan request the model can emit but never wave through on
 * its own: Truth-in-Lending (Reg Z) requires the applicant see + acknowledge the
 * mandatory disclosures before the request proceeds. Reusing the shared
 * `acknowledge` step-up mechanism ({@link stepUpApproval} / {@link stepUpViolations})
 * instead of authoring its own, any credit request escalates to
 * `MandatoryDisclosure` until acknowledged; an acknowledgement-bearing
 * re-submission passes. `.strict()` turns away a fabricated "Confirm" button or
 * smuggled card data.
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
import { CREDIT_REQUEST_MINOR, STRIPE_MAX_MINOR, STRIPE_MIN_MINOR } from "../thresholds.js";

const base = z
  .object({
    amount: minorUnitAmount
      .min(STRIPE_MIN_MINOR, "amount below the minimum charge")
      .max(STRIPE_MAX_MINOR, "amount exceeds the maximum charge"),
    currency: currencyCode,
    productType: z.enum(["personal_loan", "line_of_credit", "card"]),
    termMonths: z.number().int().positive().optional(),
    title: z.string().min(1).max(160),
    version: z.string().min(1).max(40),
    /** Verbatim Truth-in-Lending paragraphs SINA injects — bounded so a hostile stream can't flood the client. */
    body: z
      .array(z.string().min(1).max(2000))
      .min(1, "a credit request needs disclosure text")
      .max(30),
  })
  .strict();

/** The credit-request payload plus the optional shared step-up envelope. */
export const creditRequestPayload = base.extend({ stepUp: stepUpApproval.optional() }).strict();

export type CreditRequestPayload = z.infer<typeof creditRequestPayload>;

export const CREDIT_REQUEST_VERSION = "1.0.0";

/** Never store prohibited card data; keep an approver identity out of the audit log. */
export const CREDIT_REQUEST_REDACTION: RedactionConfig = {
  drop: [...PROHIBITED_CARD_FIELDS, "secondFactor"],
  hash: ["approverId"],
};

/**
 * Post-parse policy, curried over the server-supplied {@link ActionContext}.
 * Unconditional: a credit request always owes its Reg Z / TILA disclosures, so
 * every request escalates to `MandatoryDisclosure` until the actor acknowledges
 * them (the shared `acknowledge` step-up mode). USD bands only (FX equivalence
 * deferred, by design — matches the wire schema).
 */
export function makeCreditRequestPolicy(ctx: ActionContext) {
  return function creditRequestPolicy(data: CreditRequestPayload): Violation[] {
    const violations: Violation[] = [];

    // A larger request additionally carries extended TILA disclosures (non-blocking flag).
    if (data.amount > CREDIT_REQUEST_MINOR) {
      violations.push({
        code: "CREDIT_REVIEW_REQUIRED",
        message: "credit request above $5,000 — extended Truth-in-Lending disclosures apply",
        standard: "Reg Z / TILA (12 CFR 1026) — required disclosures",
        severity: "flag",
      });
    }

    // Unconditional: the mandatory disclosures must be acknowledged before the
    // request proceeds. Absent acknowledgement → escalate to MandatoryDisclosure.
    violations.push(
      ...stepUpViolations(data, ctx, {
        mode: "acknowledge",
        code: "CREDIT_DISCLOSURE",
        message: "required Truth-in-Lending disclosures must be acknowledged before proceeding",
        standard: "Reg Z / TILA (12 CFR 1026) — required disclosures",
      }),
    );

    return violations;
  };
}

/**
 * Evaluate a credit-request intent against the constitution (server-side gate +
 * audit). The initial intent (no acknowledgement) escalates to
 * `MandatoryDisclosure`; an acknowledgement-bearing re-submission passes.
 * `ctx.initiatorId` is server-known, never from the payload.
 */
export function evaluateCreditRequest(
  payload: unknown,
  ctx: ActionContext = { initiatorId: ACTION_INITIATOR_ID },
): InterceptionResult {
  return intercept(
    {
      schema: creditRequestPayload,
      policy: makeCreditRequestPolicy(ctx),
      escalations: { CREDIT_DISCLOSURE: "MandatoryDisclosure" },
      redaction: CREDIT_REQUEST_REDACTION,
      version: CREDIT_REQUEST_VERSION,
    },
    payload,
  );
}
