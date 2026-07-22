/**
 * The add-user constitution — a governed team-management flow (Phase 6).
 *
 * Adding an authorized user to an account is a sensitive security change, so the
 * constitution *unconditionally* escalates it to the `GovernedActionDialog` until
 * the actor clears it with a second-factor re-authentication. It reuses the
 * shared {@link stepUpApproval} / {@link stepUpViolations} step-up mechanism
 * (`second-factor` mode) rather than authoring its own dual-control. `.strict()`
 * turns away a fabricated "Confirm" button or smuggled card data.
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
    name: z.string().min(1, "name is required").max(80, "name exceeds 80 chars"),
    email: z.string().email("a valid email is required").max(120, "email exceeds 120 chars"),
    role: z.enum(["viewer", "member", "admin"]),
  })
  .strict();

/** The add-user payload plus the optional shared step-up envelope. */
export const addUserPayload = base.extend({ stepUp: stepUpApproval.optional() }).strict();

export type AddUserPayload = z.infer<typeof addUserPayload>;

export const ADD_USER_VERSION = "1.0.0";

/** Never store prohibited card data or a second factor; keep the approver out of the log. */
export const ADD_USER_REDACTION: RedactionConfig = {
  drop: [...PROHIBITED_CARD_FIELDS, "secondFactor"],
  hash: ["approverId"],
};

/**
 * Post-parse policy, curried over the server-supplied {@link ActionContext}.
 * Unconditional: adding an authorized user always requires a second-factor
 * re-authentication, so an intent without a sufficient step-up escalates.
 */
export function makeAddUserPolicy(ctx: ActionContext) {
  return function addUserPolicy(data: AddUserPayload): Violation[] {
    return stepUpViolations(data, ctx, {
      mode: "second-factor",
      code: "ADD_USER_STEP_UP",
      message: "adding an authorized user requires a second-factor re-authentication",
      standard: "SINA policy — authorized-user verification",
    });
  };
}

/**
 * Evaluate an add-user intent against the constitution (server-side gate +
 * audit). An intent with no step-up escalates to the `GovernedActionDialog`; a
 * second-factor-bearing re-submission passes. `ctx.initiatorId` is server-known,
 * never from the payload.
 */
export function evaluateAddUser(
  payload: unknown,
  ctx: ActionContext = { initiatorId: ACTION_INITIATOR_ID },
): InterceptionResult {
  return intercept(
    {
      schema: addUserPayload,
      policy: makeAddUserPolicy(ctx),
      escalations: { ADD_USER_STEP_UP: "GovernedActionDialog" },
      redaction: ADD_USER_REDACTION,
      version: ADD_USER_VERSION,
    },
    payload,
  );
}
