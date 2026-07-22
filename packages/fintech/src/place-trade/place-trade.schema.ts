/**
 * The place-trade constitution — a governed trading flow (Phase 6).
 *
 * Submitting a securities order is a suitability-sensitive action, so it reuses
 * the shared {@link stepUpApproval} / {@link stepUpViolations} dual-control
 * mechanism in `second-factor` mode instead of authoring its own. There is no
 * threshold — the step-up is unconditional: every order escalates to the
 * `GovernedActionDialog` until the actor confirms it with a one-time code, and a
 * re-submission carrying a valid second factor passes. `.strict()` turns away a
 * fabricated "Confirm" button or smuggled card data.
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

const base = z
  .object({
    symbol: z.string().min(1, "symbol is required").max(12, "symbol exceeds 12 chars"),
    side: z.enum(["buy", "sell"]),
    quantity: z.number().positive("quantity must be positive"),
    orderType: z.enum(["market", "limit"]),
    limitPrice: minorUnitAmount.optional(),
    currency: currencyCode,
  })
  .strict();

/** The place-trade payload plus the optional shared step-up envelope. */
export const placeTradePayload = base
  .extend({ stepUp: stepUpApproval.optional() })
  .strict();

export type PlaceTradePayload = z.infer<typeof placeTradePayload>;

export const PLACE_TRADE_VERSION = "1.0.0";

/** Never store prohibited card data or the raw second factor; keep approver identity out of the clear. */
export const PLACE_TRADE_REDACTION: RedactionConfig = {
  drop: [...PROHIBITED_CARD_FIELDS, "secondFactor"],
  hash: ["approverId"],
};

/**
 * Post-parse policy, curried over the server-supplied {@link ActionContext}. A
 * securities order always requires an order-confirmation step-up — no threshold,
 * unconditional.
 */
export function makePlaceTradePolicy(ctx: ActionContext) {
  return function placeTradePolicy(data: PlaceTradePayload): Violation[] {
    return stepUpViolations(data, ctx, {
      mode: "second-factor",
      code: "TRADE_STEP_UP",
      message: "placing a securities order requires order confirmation",
      standard: "FINRA Rule 2111 (suitability) / SINA order confirmation",
    });
  };
}

/**
 * Evaluate a place-trade intent against the constitution (server-side gate +
 * audit). Absent a second factor it escalates to the `GovernedActionDialog`; a
 * re-submission carrying a valid one-time code passes. `ctx.initiatorId` is
 * server-known, never from the payload.
 */
export function evaluatePlaceTrade(
  payload: unknown,
  ctx: ActionContext = { initiatorId: ACTION_INITIATOR_ID },
): InterceptionResult {
  return intercept(
    {
      schema: placeTradePayload,
      policy: makePlaceTradePolicy(ctx),
      escalations: { TRADE_STEP_UP: "GovernedActionDialog" },
      redaction: PLACE_TRADE_REDACTION,
      version: PLACE_TRADE_VERSION,
    },
    payload,
  );
}
