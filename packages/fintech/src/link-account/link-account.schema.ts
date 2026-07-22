/**
 * The account-link constitution — a governed account-linking flow (Phase 6).
 *
 * Linking an external account is a sensitive consent action: the constitution
 * escalates every link to the `GovernedActionDialog` until the actor clears it
 * with a second-factor re-authentication. It reuses the shared
 * {@link stepUpApproval} / {@link stepUpViolations} step-up mechanism
 * (`second-factor` mode) rather than authoring its own dual-control. The account
 * is only ever a masked reference — never a full number — and `.strict()` turns
 * away a fabricated "Confirm" button or smuggled raw credentials (a `password`).
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
    institution: z.string().min(1).max(80),
    account: maskedAccountRef,
    consent: z.boolean(),
  })
  // `.strict()` rejects any smuggled `password` / `credentials` field.
  .strict();

/** The account-link payload plus the optional shared step-up envelope. */
export const linkAccountPayload = base.extend({ stepUp: stepUpApproval.optional() }).strict();

export type LinkAccountPayload = z.infer<typeof linkAccountPayload>;

export const LINK_ACCOUNT_VERSION = "1.0.0";

/** Never store raw credentials or a second factor; keep the masked tail and approver out of the log. */
export const LINK_ACCOUNT_REDACTION: RedactionConfig = {
  drop: [...PROHIBITED_CARD_FIELDS, "secondFactor", "password", "credentials"],
  mask: ["maskedNumber"],
  hash: ["approverId"],
};

/**
 * Post-parse policy, curried over the server-supplied {@link ActionContext}.
 * Unconditional: every account link requires a second-factor re-authentication,
 * so an intent that arrives without one escalates. No cited monetary thresholds
 * apply — the standard is SINA's account-link consent policy.
 */
export function makeLinkAccountPolicy(ctx: ActionContext) {
  return function linkAccountPolicy(data: LinkAccountPayload): Violation[] {
    return stepUpViolations(data, ctx, {
      mode: "second-factor",
      code: "LINK_ACCOUNT_STEP_UP",
      message: "linking an external account requires a second-factor re-authentication",
      standard: "SINA policy — account-link consent",
    });
  };
}

/**
 * Evaluate an account-link intent against the constitution (server-side gate +
 * audit). A bare link with no step-up escalates to the `GovernedActionDialog`; a
 * second-factor-bearing re-submission passes. `ctx.initiatorId` is server-known,
 * never from the payload.
 */
export function evaluateLinkAccount(
  payload: unknown,
  ctx: ActionContext = { initiatorId: ACTION_INITIATOR_ID },
): InterceptionResult {
  return intercept(
    {
      schema: linkAccountPayload,
      policy: makeLinkAccountPolicy(ctx),
      escalations: { LINK_ACCOUNT_STEP_UP: "GovernedActionDialog" },
      redaction: LINK_ACCOUNT_REDACTION,
      version: LINK_ACCOUNT_VERSION,
    },
    payload,
  );
}
