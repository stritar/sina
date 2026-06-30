/**
 * The wire-transfer constitution — the flagship governed schema.
 *
 * Layers, in order of how the payload is gated:
 *   1. Structure + format (this schema): closed (`.strict()`) object, ISO 4217
 *      currency, integer minor-unit amount within Stripe bounds, and a SEPA
 *      (IBAN+BIC) or ACH (routing+account) party account.
 *   2. Policy ({@link wirePolicy}): the cited regulatory/limit bands.
 *
 * `.strict()` rejects any key not in the schema — which is how a fabricated
 * "Confirm" button or smuggled card data (CVV/PIN) is turned away. Prohibited
 * card fields are additionally on the audit redaction drop-list.
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
import { iban } from "../formats/iban.js";
import { bic } from "../formats/bic.js";
import { abaRouting } from "../formats/routing.js";
import { PROHIBITED_CARD_FIELDS } from "../formats/card.js";
import {
  CTR_MINOR,
  SAR_MINOR,
  STRIPE_MAX_MINOR,
  STRIPE_MIN_MINOR,
  TRAVEL_RULE_MINOR,
  WIRE_SECONDARY_APPROVAL_MINOR,
} from "../thresholds.js";

/** SEPA leg: IBAN + BIC (ISO 13616 / ISO 9362). */
const sepaAccount = z
  .object({
    scheme: z.literal("sepa"),
    iban,
    bic,
  })
  .strict();

/** ACH leg: ABA routing number + account number. */
const achAccount = z
  .object({
    scheme: z.literal("ach"),
    routingNumber: abaRouting,
    accountNumber: z.string().regex(/^\d{4,17}$/, "account number must be 4–17 digits"),
  })
  .strict();

/** A bank account: SEPA or ACH, discriminated by `scheme` for precise errors. */
const account = z.discriminatedUnion("scheme", [sepaAccount, achAccount]);

/** A party to the transfer. `address` is structurally optional; the Travel Rule requires it above $3k. */
const party = z
  .object({
    name: z.string().min(1, "party name is required"),
    address: z.string().min(1).optional(),
    account,
  })
  .strict();

export const wireTransferPayload = z
  .object({
    amount: minorUnitAmount
      .min(STRIPE_MIN_MINOR, "amount below the minimum charge")
      .max(STRIPE_MAX_MINOR, "amount exceeds the maximum charge"),
    currency: currencyCode,
    debtor: party,
    creditor: party,
    reference: z.string().max(140, "reference exceeds 140 chars (ISO 20022 / SEPA)").optional(),
  })
  .strict();

export type WireTransferPayload = z.infer<typeof wireTransferPayload>;
type Party = WireTransferPayload["debtor"];

/** Machine codes this constitution can emit (downstream switches on these). */
export type WireViolationCode =
  | "TRAVEL_RULE_INFO_MISSING"
  | "SAR_REVIEW"
  | "CTR_REPORTABLE"
  | "AMOUNT_REQUIRES_APPROVAL";

export const WIRE_CONSTITUTION_VERSION = "1.0.0";

function hasTravelRuleInfo(p: Party): boolean {
  return Boolean(p.name && p.address);
}

/**
 * Post-parse policy: the cited regulatory bands. Bands are USD-only — a non-USD
 * transfer passes format validation but is not run through the USD thresholds
 * (FX equivalence is deferred, by design — see `thresholds`).
 */
export function wirePolicy(data: WireTransferPayload): Violation[] {
  const violations: Violation[] = [];
  if (data.currency !== "USD") return violations;

  const { amount } = data;

  if (amount >= TRAVEL_RULE_MINOR && !(hasTravelRuleInfo(data.debtor) && hasTravelRuleInfo(data.creditor))) {
    violations.push({
      code: "TRAVEL_RULE_INFO_MISSING",
      message: "transfers ≥ $3,000 require originator and beneficiary name + address",
      standard: "31 CFR 1010.410(e) / 1020.320",
      severity: "escalate",
    });
  }

  if (amount >= SAR_MINOR) {
    violations.push({
      code: "SAR_REVIEW",
      message: "amount ≥ $5,000 — flagged for suspicious-activity review",
      standard: "31 CFR Chapter X (FinCEN SAR)",
      severity: "flag",
    });
  }

  if (amount > CTR_MINOR) {
    violations.push({
      code: "CTR_REPORTABLE",
      message: "currency transaction > $10,000 — Currency Transaction Report applies",
      standard: "31 CFR 1010.311",
      severity: "flag",
    });
  }

  if (amount > WIRE_SECONDARY_APPROVAL_MINOR) {
    violations.push({
      code: "AMOUNT_REQUIRES_APPROVAL",
      message: "wire above $50,000 requires secondary managerial approval",
      standard: "SINA design hand-off (ROADMAP §Phase 3)",
      severity: "escalate",
    });
  }

  return violations;
}

/** Never store prohibited card data; keep raw account identifiers out of the audit log. */
const WIRE_REDACTION: RedactionConfig = {
  drop: [...PROHIBITED_CARD_FIELDS],
  hash: ["iban", "accountNumber"],
};

/** Evaluate a wire-transfer intent against the constitution (server-side gate + audit). */
export function evaluateWireTransfer(payload: unknown): InterceptionResult {
  return intercept(
    {
      schema: wireTransferPayload,
      policy: wirePolicy,
      escalations: {
        AMOUNT_REQUIRES_APPROVAL: "SecureWireDialog",
        TRAVEL_RULE_INFO_MISSING: "SecureWireDialog",
      },
      redaction: WIRE_REDACTION,
      version: WIRE_CONSTITUTION_VERSION,
    },
    payload,
  );
}
