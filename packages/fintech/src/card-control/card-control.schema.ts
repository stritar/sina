/**
 * The card-control constitution — a governed card-operations flow (Phase 6).
 *
 * Freeze / unfreeze a card is reversible and passes cleanly; a *destructive*
 * card action (cancel or replace) is irreversible, so the constitution escalates
 * it to the `GovernedActionDialog` until the actor clears it with a second-factor
 * re-authentication. It reuses the shared {@link stepUpApproval} /
 * {@link stepUpViolations} step-up mechanism (`second-factor` mode) rather than
 * authoring its own dual-control. The card is only ever a masked reference —
 * never a full PAN — and `.strict()` turns away a fabricated "Confirm" button or
 * smuggled card data.
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
    action: z.enum(["freeze", "unfreeze", "cancel", "replace"]),
    card: maskedAccountRef,
  })
  .strict();

/** The card-control payload plus the optional shared step-up envelope. */
export const cardControlPayload = base.extend({ stepUp: stepUpApproval.optional() }).strict();

export type CardControlPayload = z.infer<typeof cardControlPayload>;

export const CARD_CONTROL_VERSION = "1.0.0";

/** Never store prohibited card data or a second factor; keep the masked tail and approver out of the log. */
export const CARD_CONTROL_REDACTION: RedactionConfig = {
  drop: [...PROHIBITED_CARD_FIELDS, "secondFactor"],
  mask: ["maskedNumber"],
  hash: ["approverId"],
};

/**
 * Post-parse policy, curried over the server-supplied {@link ActionContext}.
 * Conditional on destructiveness: `cancel` / `replace` are irreversible and
 * require a second-factor re-authentication; `freeze` / `unfreeze` are reversible
 * and pass without step-up.
 */
export function makeCardControlPolicy(ctx: ActionContext) {
  return function cardControlPolicy(data: CardControlPayload): Violation[] {
    const violations: Violation[] = [];

    if (data.action === "cancel" || data.action === "replace") {
      violations.push(
        ...stepUpViolations(data, ctx, {
          mode: "second-factor",
          code: "CARD_CONTROL_STEP_UP",
          message: "destructive card action requires a second-factor re-authentication",
          standard: "SINA policy — destructive card action step-up",
        }),
      );
    }

    return violations;
  };
}

/**
 * Evaluate a card-control intent against the constitution (server-side gate +
 * audit). A destructive action with no step-up escalates to the
 * `GovernedActionDialog`; a second-factor-bearing re-submission passes.
 * `ctx.initiatorId` is server-known, never from the payload.
 */
export function evaluateCardControl(
  payload: unknown,
  ctx: ActionContext = { initiatorId: ACTION_INITIATOR_ID },
): InterceptionResult {
  return intercept(
    {
      schema: cardControlPayload,
      policy: makeCardControlPolicy(ctx),
      escalations: { CARD_CONTROL_STEP_UP: "GovernedActionDialog" },
      redaction: CARD_CONTROL_REDACTION,
      version: CARD_CONTROL_VERSION,
    },
    payload,
  );
}
