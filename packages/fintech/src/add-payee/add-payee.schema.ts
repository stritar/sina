/**
 * The add-payee constitution — a governed payments flow (Phase 6).
 *
 * Registering a new payee is a fraud-sensitive, hard-to-reverse change, so the
 * constitution *unconditionally* escalates it to the `GovernedActionDialog` until
 * the actor clears it with a second-factor re-authentication (new-payee
 * verification — micro-deposit / sanctions screening). It reuses the shared
 * {@link stepUpApproval} / {@link stepUpViolations} step-up mechanism
 * (`second-factor` mode) rather than authoring its own dual-control. The payee's
 * account is only ever a masked reference — never a full number — and `.strict()`
 * turns away a fabricated "Confirm" button or smuggled card data.
 */

import { z } from "zod";
import {
  intercept,
  type InterceptionResult,
  type RedactionConfig,
  type Violation,
} from "@sina-design-system/governance";

import { maskedNumber } from "../formats/masked-account.js";
import { PROHIBITED_CARD_FIELDS } from "../formats/card.js";
import {
  ACTION_INITIATOR_ID,
  stepUpApproval,
  stepUpViolations,
  type ActionContext,
} from "../formats/step-up.js";

const base = z
  .object({
    name: z.string().min(1).max(80),
    maskedNumber,
    routingHint: z.string().min(1).max(20).optional(),
  })
  .strict();

/** The add-payee payload plus the optional shared step-up envelope. */
export const addPayeePayload = base.extend({ stepUp: stepUpApproval.optional() }).strict();

export type AddPayeePayload = z.infer<typeof addPayeePayload>;

export const ADD_PAYEE_VERSION = "1.0.0";

/** Never store prohibited card data or a second factor; keep the masked tail and approver out of the log. */
export const ADD_PAYEE_REDACTION: RedactionConfig = {
  drop: [...PROHIBITED_CARD_FIELDS, "secondFactor"],
  mask: ["maskedNumber"],
  hash: ["approverId"],
};

/**
 * Post-parse policy, curried over the server-supplied {@link ActionContext}.
 * Unconditional: adding a payee always requires a second-factor re-authentication
 * (no threshold — every new payee is verified). No cited monetary flags apply.
 */
export function makeAddPayeePolicy(ctx: ActionContext) {
  return function addPayeePolicy(data: AddPayeePayload): Violation[] {
    return stepUpViolations(data, ctx, {
      mode: "second-factor",
      code: "ADD_PAYEE_STEP_UP",
      message: "adding a new payee requires a second-factor verification",
      standard: "SINA policy — new-payee verification (micro-deposit/sanctions)",
    });
  };
}

/**
 * Evaluate an add-payee intent against the constitution (server-side gate +
 * audit). A new payee with no step-up escalates to the `GovernedActionDialog`; a
 * second-factor-bearing re-submission passes. `ctx.initiatorId` is server-known,
 * never from the payload.
 */
export function evaluateAddPayee(
  payload: unknown,
  ctx: ActionContext = { initiatorId: ACTION_INITIATOR_ID },
): InterceptionResult {
  return intercept(
    {
      schema: addPayeePayload,
      policy: makeAddPayeePolicy(ctx),
      escalations: { ADD_PAYEE_STEP_UP: "GovernedActionDialog" },
      redaction: ADD_PAYEE_REDACTION,
      version: ADD_PAYEE_VERSION,
    },
    payload,
  );
}
