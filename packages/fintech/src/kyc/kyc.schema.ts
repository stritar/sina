/**
 * The KYC constitution — a governed identity-verification flow (Phase 6).
 *
 * A simplified stand-in for a full Customer Identification Program: it reuses the
 * shared {@link stepUpApproval} / {@link stepUpViolations} dual-control mechanism
 * (second-factor mode) instead of authoring its own, so a KYC submission *always*
 * requires the actor to re-authenticate before it clears — an un-verified request
 * escalates to the `GovernedActionDialog`. A production CIP would layer document
 * checks, sanctions/PEP screening, and ongoing CDD onto this same envelope; here
 * the second factor is the single, unconditional gate.
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

import { PROHIBITED_CARD_FIELDS } from "../formats/card.js";
import {
  ACTION_INITIATOR_ID,
  stepUpApproval,
  stepUpViolations,
  type ActionContext,
} from "../formats/step-up.js";

const base = z
  .object({
    fullName: z.string().min(1).max(120),
    country: z.string().length(2),
    idType: z.enum(["passport", "drivers_license", "national_id"]),
    idLast4: z.string().regex(/^\d{4}$/, "id last four must be 4 digits"),
  })
  .strict();

/** The KYC payload plus the optional shared step-up envelope. */
export const kycPayload = base.extend({ stepUp: stepUpApproval.optional() }).strict();

export type KycPayload = z.infer<typeof kycPayload>;

export const KYC_VERSION = "1.0.0";

/** Never store prohibited card data; keep the second factor + approver out of the audit log. */
export const KYC_REDACTION: RedactionConfig = {
  drop: [...PROHIBITED_CARD_FIELDS, "secondFactor"],
  hash: ["approverId"],
};

/**
 * Post-parse policy, curried over the server-supplied {@link ActionContext}. A KYC
 * submission is *unconditionally* gated: there is no "below threshold" path, so it
 * always requires a second-factor step-up before it clears.
 */
export function makeKycPolicy(ctx: ActionContext) {
  return function kycPolicy(data: KycPayload): Violation[] {
    return stepUpViolations(data, ctx, {
      mode: "second-factor",
      code: "KYC_STEP_UP",
      message: "identity verification requires second-factor authentication",
      standard: "31 CFR 1020.220 (CIP) / SINA KYC",
    });
  };
}

/**
 * Evaluate a KYC intent against the constitution (server-side gate + audit).
 * Handles the initial intent (no step-up → escalate) and a second-factor-bearing
 * re-submission (→ pass). `ctx.initiatorId` is server-known, never from the payload.
 */
export function evaluateKyc(
  payload: unknown,
  ctx: ActionContext = { initiatorId: ACTION_INITIATOR_ID },
): InterceptionResult {
  return intercept(
    {
      schema: kycPayload,
      policy: makeKycPolicy(ctx),
      escalations: { KYC_STEP_UP: "GovernedActionDialog" },
      redaction: KYC_REDACTION,
      version: KYC_VERSION,
    },
    payload,
  );
}
