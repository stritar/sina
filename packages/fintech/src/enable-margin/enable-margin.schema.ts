/**
 * The enable-margin constitution — a governed brokerage flow (Phase 6).
 *
 * Turning on margin borrowing requires the customer to first read a verbatim
 * margin-risk disclosure the model cannot alter or omit. SINA carries the
 * disclosure `title`/`version`/`body` on the intent (like the disclosure schema)
 * and reuses the shared `acknowledge` step-up mechanism
 * ({@link stepUpApproval} / {@link stepUpViolations}) instead of authoring its own:
 * enabling margin *always* escalates to `MandatoryDisclosure` until the actor
 * acknowledges the disclosure — an unconditional step-up, no threshold. `.strict()`
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
    accountId: z.string().min(1).max(40),
    marginTier: z.enum(["reg_t", "portfolio"]),
    title: z.string().min(1).max(160),
    version: z.string().min(1).max(40),
    /** Verbatim margin-disclosure paragraphs SINA injects — bounded so a hostile stream can't flood the client. */
    body: z.array(z.string().min(1).max(2000)).min(1, "a disclosure needs text").max(30),
  })
  .strict();

/** The enable-margin payload plus the optional shared step-up envelope. */
export const enableMarginPayload = base.extend({ stepUp: stepUpApproval.optional() }).strict();

export type EnableMarginPayload = z.infer<typeof enableMarginPayload>;

export const ENABLE_MARGIN_VERSION = "1.0.0";

/** Never store prohibited card data; keep raw approver identity out of the audit log. */
export const ENABLE_MARGIN_REDACTION: RedactionConfig = {
  drop: [...PROHIBITED_CARD_FIELDS, "secondFactor"],
  hash: ["approverId"],
};

/**
 * Enabling margin must always be acknowledged before it proceeds — an
 * unconditional step-up (no threshold), curried over the server-supplied
 * {@link ActionContext}.
 */
export function makeEnableMarginPolicy(ctx: ActionContext) {
  return function enableMarginPolicy(data: EnableMarginPayload): Violation[] {
    return stepUpViolations(data, ctx, {
      mode: "acknowledge",
      code: "MARGIN_DISCLOSURE",
      message: "the margin-account disclosure must be acknowledged before margin is enabled",
      standard: "FINRA Rule 2264 (margin disclosure) / Reg T",
    });
  };
}

/** Evaluate an enable-margin intent (server-side gate + audit). */
export function evaluateEnableMargin(
  payload: unknown,
  ctx: ActionContext = { initiatorId: ACTION_INITIATOR_ID },
): InterceptionResult {
  return intercept(
    {
      schema: enableMarginPayload,
      policy: makeEnableMarginPolicy(ctx),
      escalations: { MARGIN_DISCLOSURE: "MandatoryDisclosure" },
      redaction: ENABLE_MARGIN_REDACTION,
      version: ENABLE_MARGIN_VERSION,
    },
    payload,
  );
}
