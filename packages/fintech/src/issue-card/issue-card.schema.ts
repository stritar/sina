/**
 * The issue-card constitution — a governed card-issuance flow (Phase 6).
 *
 * Issuing a card is a sensitive identity action, so it reuses the shared
 * {@link stepUpApproval} / {@link stepUpViolations} dual-control mechanism in
 * `second-factor` mode instead of authoring its own. There is no threshold — the
 * step-up is unconditional: every issuance escalates to the `GovernedActionDialog`
 * until the actor re-authenticates with a one-time code, and a re-submission
 * carrying a valid second factor passes. `.strict()` turns away a fabricated
 * "Confirm" button or smuggled card data.
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

const issueCardBase = z
  .object({
    cardType: z.enum(["virtual", "physical"]),
    holder: z.string().min(1, "cardholder name is required").max(80, "holder exceeds 80 chars"),
    spendLimit: minorUnitAmount.optional(),
    currency: currencyCode.optional(),
  })
  .strict();

/** The issue-card payload plus the optional shared step-up envelope. */
export const issueCardPayload = issueCardBase
  .extend({ stepUp: stepUpApproval.optional() })
  .strict();

export type IssueCardPayload = z.infer<typeof issueCardPayload>;

export const ISSUE_CARD_VERSION = "1.0.0";

/** Never store prohibited card data or the raw second factor; keep approver identity out of the clear. */
export const ISSUE_CARD_REDACTION: RedactionConfig = {
  drop: [...PROHIBITED_CARD_FIELDS, "secondFactor"],
  hash: ["approverId"],
};

/**
 * Post-parse policy, curried over the server-supplied {@link ActionContext}. Card
 * issuance always requires an identity step-up — no threshold, unconditional.
 */
export function makeIssueCardPolicy(ctx: ActionContext) {
  return function issueCardPolicy(data: IssueCardPayload): Violation[] {
    return stepUpViolations(data, ctx, {
      mode: "second-factor",
      code: "ISSUE_CARD_STEP_UP",
      message: "card issuance requires identity re-verification",
      standard: "SINA policy — card issuance identity step-up",
    });
  };
}

/**
 * Evaluate an issue-card intent against the constitution (server-side gate +
 * audit). Absent a second factor it escalates to the `GovernedActionDialog`; a
 * re-submission carrying a valid one-time code passes. `ctx.initiatorId` is
 * server-known, never from the payload.
 */
export function evaluateIssueCard(
  payload: unknown,
  ctx: ActionContext = { initiatorId: ACTION_INITIATOR_ID },
): InterceptionResult {
  return intercept(
    {
      schema: issueCardPayload,
      policy: makeIssueCardPolicy(ctx),
      escalations: { ISSUE_CARD_STEP_UP: "GovernedActionDialog" },
      redaction: ISSUE_CARD_REDACTION,
      version: ISSUE_CARD_VERSION,
    },
    payload,
  );
}
