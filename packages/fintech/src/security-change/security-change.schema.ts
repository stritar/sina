/**
 * The security-change constitution — a governed security flow (Phase 6).
 *
 * Changing a security factor (PIN, password, MFA, recovery email) is a sensitive
 * identity action, so it reuses the shared {@link stepUpApproval} /
 * {@link stepUpViolations} dual-control mechanism in `second-factor` mode instead
 * of authoring its own. There is no threshold — the step-up is unconditional:
 * every change escalates to the `GovernedActionDialog` until the actor
 * re-authenticates with a one-time code, and a re-submission carrying a valid
 * second factor passes. `.strict()` turns away a fabricated "Confirm" button or
 * smuggled card data.
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
    change: z.enum(["pin", "password", "mfa", "email"]),
  })
  .strict();

/** The security-change payload plus the optional shared step-up envelope. */
export const securityChangePayload = base
  .extend({ stepUp: stepUpApproval.optional() })
  .strict();

export type SecurityChangePayload = z.infer<typeof securityChangePayload>;

export const SECURITY_CHANGE_VERSION = "1.0.0";

/** Never store prohibited card data or the raw second factor; keep approver identity out of the clear. */
export const SECURITY_CHANGE_REDACTION: RedactionConfig = {
  drop: [...PROHIBITED_CARD_FIELDS, "secondFactor"],
  hash: ["approverId"],
};

/**
 * Post-parse policy, curried over the server-supplied {@link ActionContext}. A
 * security-factor change always requires an identity step-up — no threshold,
 * unconditional.
 */
export function makeSecurityChangePolicy(ctx: ActionContext) {
  return function securityChangePolicy(data: SecurityChangePayload): Violation[] {
    return stepUpViolations(data, ctx, {
      mode: "second-factor",
      code: "SECURITY_STEP_UP",
      message: "changing a security factor requires identity re-verification",
      standard: "SINA policy — security change 2FA",
    });
  };
}

/**
 * Evaluate a security-change intent against the constitution (server-side gate +
 * audit). Absent a second factor it escalates to the `GovernedActionDialog`; a
 * re-submission carrying a valid one-time code passes. `ctx.initiatorId` is
 * server-known, never from the payload.
 */
export function evaluateSecurityChange(
  payload: unknown,
  ctx: ActionContext = { initiatorId: ACTION_INITIATOR_ID },
): InterceptionResult {
  return intercept(
    {
      schema: securityChangePayload,
      policy: makeSecurityChangePolicy(ctx),
      escalations: { SECURITY_STEP_UP: "GovernedActionDialog" },
      redaction: SECURITY_CHANGE_REDACTION,
      version: SECURITY_CHANGE_VERSION,
    },
    payload,
  );
}
