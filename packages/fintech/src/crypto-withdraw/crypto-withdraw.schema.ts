/**
 * The crypto-withdraw constitution — a governed money-movement flow (Phase 6).
 *
 * A withdrawal of crypto to an external wallet / VASP: it reuses the shared
 * {@link stepUpApproval} / {@link stepUpViolations} dual-control mechanism instead
 * of authoring its own, so above the FATF Travel Rule threshold an un-authorized
 * withdrawal escalates to the `GovernedActionDialog`, and an authorization-bearing
 * re-submission is bound to the exact terms (four-eyes + payload binding). USD
 * bands only (FX equivalence deferred, by design — matches the wire schema).
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

import { minorUnitAmount } from "../formats/amount.js";
import { currencyCode } from "../formats/currency.js";
import { PROHIBITED_CARD_FIELDS } from "../formats/card.js";
import {
  ACTION_INITIATOR_ID,
  stepUpApproval,
  stepUpViolations,
  type ActionContext,
} from "../formats/step-up.js";
import { usdScopeFlag } from "../formats/usd-scope.js";
import { CRYPTO_TRAVEL_RULE_MINOR, STRIPE_MAX_MINOR, STRIPE_MIN_MINOR } from "../thresholds.js";

const cryptoWithdrawBase = z
  .object({
    amount: minorUnitAmount
      .min(STRIPE_MIN_MINOR, "amount below the minimum charge")
      .max(STRIPE_MAX_MINOR, "amount exceeds the maximum charge"),
    currency: currencyCode,
    /** The withdrawn asset's ticker (e.g. BTC, ETH, USDC). */
    asset: z.string().min(1, "asset ticker is required").max(12, "asset ticker exceeds 12 chars"),
    /** On-chain quantity of the asset — fractional, not a money minor-unit. */
    quantity: z.number().positive("quantity must be positive"),
    /** The destination wallet address / VASP account. */
    destination: z
      .string()
      .min(10, "destination address too short")
      .max(120, "destination address exceeds 120 chars"),
    /** The settlement network (e.g. bitcoin, ethereum, solana). */
    network: z.string().min(1, "network is required").max(20, "network exceeds 20 chars"),
  })
  .strict();

/** The crypto-withdraw payload plus the optional shared step-up envelope. */
export const cryptoWithdrawPayload = cryptoWithdrawBase
  .extend({ stepUp: stepUpApproval.optional() })
  .strict();

export type CryptoWithdrawPayload = z.infer<typeof cryptoWithdrawPayload>;

export const CRYPTO_WITHDRAW_VERSION = "1.1.0";

/** Never store prohibited card data; keep the approver identity out of the audit log. */
export const CRYPTO_WITHDRAW_REDACTION: RedactionConfig = {
  drop: [...PROHIBITED_CARD_FIELDS, "secondFactor"],
  hash: ["approverId"],
};

/**
 * Post-parse policy, curried over the server-supplied {@link ActionContext}. USD
 * bands only (FX equivalence is out of scope — matches the wire schema); a non-USD
 * pass carries a `POLICY_BANDS_NOT_EVALUATED` flag, never a silent skip. Above
 * the FATF crypto Travel Rule threshold an un-authorized withdrawal escalates; an
 * authorization-bearing re-submission is bound to the terms + separation of duties.
 */
export function makeCryptoWithdrawPolicy(ctx: ActionContext) {
  return function cryptoWithdrawPolicy(data: CryptoWithdrawPayload): Violation[] {
    const violations: Violation[] = [];
    if (data.currency !== "USD") {
      violations.push(usdScopeFlag(data.currency));
      return violations;
    }

    const { amount } = data;

    if (amount > CRYPTO_TRAVEL_RULE_MINOR) {
      violations.push(
        ...stepUpViolations(data, ctx, {
          mode: "approval",
          code: "CRYPTO_TRAVEL_RULE",
          message:
            "crypto withdrawal above the FATF Travel Rule threshold requires authorization",
          standard: "FATF R.16 / 31 CFR 1010.410 (crypto Travel Rule)",
        }),
      );
    }

    return violations;
  };
}

/**
 * Evaluate a crypto-withdraw intent against the constitution (server-side gate +
 * audit). Handles the initial intent (no step-up → escalate) and an
 * authorization-bearing re-submission (bind + separation-of-duties → pass or
 * reject). `ctx.initiatorId` is server-known, never from the payload.
 */
export function evaluateCryptoWithdraw(
  payload: unknown,
  ctx: ActionContext = { initiatorId: ACTION_INITIATOR_ID },
): InterceptionResult {
  return intercept(
    {
      schema: cryptoWithdrawPayload,
      policy: makeCryptoWithdrawPolicy(ctx),
      escalations: { CRYPTO_TRAVEL_RULE: "GovernedActionDialog" },
      redaction: CRYPTO_WITHDRAW_REDACTION,
      version: CRYPTO_WITHDRAW_VERSION,
    },
    payload,
  );
}
