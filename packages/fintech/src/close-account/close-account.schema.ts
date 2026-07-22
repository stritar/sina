/**
 * The close-account constitution — a governed fintech flow (Phase 6).
 *
 * Closing an account is destructive and irreversible, so the constitution
 * escalates it *unconditionally* to the `GovernedActionDialog` until a second
 * party authorizes it. It reuses the shared {@link stepUpApproval} /
 * {@link stepUpViolations} dual-control mechanism (`approval` mode — four-eyes:
 * binding hash + separation of duties) rather than authoring its own. The
 * account is only ever a masked reference — never a full number — and
 * `.strict()` turns away a fabricated "Confirm" button or smuggled card data.
 */

import { z } from "zod";
import {
  intercept,
  type InterceptionResult,
  type RedactionConfig,
  type Violation,
} from "@sina-design-system/governance";

import { maskedAccountRef } from "../formats/masked-account.js";
import { PROHIBITED_CARD_FIELDS } from "../formats/card.js";
import {
  ACTION_INITIATOR_ID,
  stepUpApproval,
  stepUpViolations,
  type ActionContext,
} from "../formats/step-up.js";

const base = z
  .object({
    accountId: z.string().min(1).max(40),
    account: maskedAccountRef,
    reason: z.string().min(1).max(280).optional(),
  })
  .strict();

/** The close-account payload plus the optional shared step-up envelope. */
export const closeAccountPayload = base.extend({ stepUp: stepUpApproval.optional() }).strict();

export type CloseAccountPayload = z.infer<typeof closeAccountPayload>;

export const CLOSE_ACCOUNT_VERSION = "1.0.0";

/** Never store prohibited card data or a second factor; keep the masked tail and approver out of the log. */
export const CLOSE_ACCOUNT_REDACTION: RedactionConfig = {
  drop: [...PROHIBITED_CARD_FIELDS, "secondFactor"],
  mask: ["maskedNumber"],
  hash: ["approverId"],
};

/**
 * Post-parse policy, curried over the server-supplied {@link ActionContext}.
 * Unconditional: closing an account is irreversible, so it *always* requires a
 * second-party authorization (four-eyes) regardless of the submitted terms.
 */
export function makeCloseAccountPolicy(ctx: ActionContext) {
  return function closeAccountPolicy(data: CloseAccountPayload): Violation[] {
    return stepUpViolations(data, ctx, {
      mode: "approval",
      code: "CLOSE_ACCOUNT_STEP_UP",
      message: "closing an account requires a second-party authorization",
      standard: "SINA dual-control — account closure",
    });
  };
}

/**
 * Evaluate a close-account intent against the constitution (server-side gate +
 * audit). An un-authorized intent escalates to the `GovernedActionDialog`; an
 * authorization-bearing re-submission is bound to the exact terms (four-eyes +
 * payload binding) → pass or reject. `ctx.initiatorId` is server-known, never
 * from the payload.
 */
export function evaluateCloseAccount(
  payload: unknown,
  ctx: ActionContext = { initiatorId: ACTION_INITIATOR_ID },
): InterceptionResult {
  return intercept(
    {
      schema: closeAccountPayload,
      policy: makeCloseAccountPolicy(ctx),
      escalations: { CLOSE_ACCOUNT_STEP_UP: "GovernedActionDialog" },
      redaction: CLOSE_ACCOUNT_REDACTION,
      version: CLOSE_ACCOUNT_VERSION,
    },
    payload,
  );
}
