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
import { coreTerms, payloadHash } from "../formats/canonical.js";
import { usdScopeFlag } from "../formats/usd-scope.js";
import {
  CTR_MINOR,
  SAR_MINOR,
  STRIPE_MAX_MINOR,
  STRIPE_MIN_MINOR,
  TRAVEL_RULE_MINOR,
  WIRE_SECONDARY_APPROVAL_MINOR,
} from "../thresholds.js";

/**
 * SEPA leg: IBAN (ISO 13616) + optional BIC (ISO 9362). The BIC is optional per
 * the SEPA "IBAN-only" rule (Regulation (EU) 260/2012 — the IBAN identifies the
 * account on its own); it is format-checked when present.
 */
const sepaAccount = z
  .object({
    scheme: z.literal("sepa"),
    iban,
    bic: bic.optional(),
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

/**
 * Secondary-approval envelope (Phase 5). A wire above the approval threshold
 * cannot execute until a second party attaches one of these. `.strict()` so a
 * key smuggled *inside* the approval is rejected like any other fabricated field.
 *
 * Trust boundaries:
 *   - `approverId` is the human approver's identity (payload-supplied, then
 *     checked against a server-known initiator — see {@link ApprovalContext}).
 *   - `payloadHash` binds this approval to the exact transfer terms; the gate
 *     recomputes it server-side and never trusts the streamed value.
 */
export const wireApproval = z
  .object({
    approverId: z.string().min(1, "approver id is required"),
    approverName: z.string().min(1, "approver name is required"),
    secondFactor: z.string().regex(/^\d{6}$/, "second factor must be a 6-digit code").optional(),
    payloadHash: z.string().min(1, "approval must bind to the transfer terms"),
    /** Reserved for Phase 10 freshness/replay checks (no server challenge store yet). */
    challengeId: z.string().optional(),
  })
  .strict();

export type WireApproval = z.infer<typeof wireApproval>;

/**
 * The wire schema plus an optional approval. Optional ⇒ every unapproved intent
 * still parses (and escalates on the threshold); an approval-bearing re-submission
 * is validated by {@link makeWirePolicy}. Still `.strict()` at the top level.
 */
export const approvedWireTransferPayload = wireTransferPayload
  .extend({ approval: wireApproval.optional() })
  .strict();

export type ApprovedWireTransferPayload = z.infer<typeof approvedWireTransferPayload>;

/**
 * Server-supplied evaluation context. The initiator identity is **never** taken
 * from the payload — the model *is* the initiator, so a streamed `initiatorId`
 * could satisfy its own self-approval check. A real deployment passes the
 * session identity; the emulator passes {@link AGENT_INITIATOR_ID}.
 */
export interface ApprovalContext {
  initiatorId: string;
}

/** The emulator's stand-in initiator — the agent that emitted the intent. */
export const AGENT_INITIATOR_ID = "agent:opus";

/** Machine codes this constitution can emit (downstream switches on these). */
export type WireViolationCode =
  | "TRAVEL_RULE_INFO_MISSING"
  | "SAR_REVIEW"
  | "CTR_REPORTABLE"
  | "AMOUNT_REQUIRES_APPROVAL"
  | "SELF_APPROVAL_FORBIDDEN"
  | "APPROVAL_PAYLOAD_MISMATCH"
  | "POLICY_BANDS_NOT_EVALUATED";

export const WIRE_CONSTITUTION_VERSION = "1.2.0";

function hasTravelRuleInfo(p: Party): boolean {
  return Boolean(p.name && p.address);
}

/**
 * Post-parse policy, curried over the server-supplied {@link ApprovalContext}.
 * Bands are USD-only — a non-USD transfer passes format validation but is not
 * run through the USD thresholds (FX equivalence is out of scope). The skip is
 * never silent: the pass carries a `POLICY_BANDS_NOT_EVALUATED` flag.
 */
export function makeWirePolicy(ctx: ApprovalContext) {
  return function wirePolicy(data: ApprovedWireTransferPayload): Violation[] {
    const violations: Violation[] = [];
    if (data.currency !== "USD") {
      violations.push(usdScopeFlag(data.currency));
      return violations;
    }

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
      violations.push(...approvalViolations(data, ctx));
    }

    return violations;
  };
}

/**
 * The dual-control gate for wires above the approval threshold. No approval ⇒
 * escalate (force the SecureWireDialog). An approval-bearing re-submission is
 * accepted only if it (a) binds to the exact terms and (b) is not self-approved.
 * Both failures are hard rejects — the un-bypassable moment.
 */
function approvalViolations(data: ApprovedWireTransferPayload, ctx: ApprovalContext): Violation[] {
  const { approval } = data;

  if (!approval) {
    return [
      {
        code: "AMOUNT_REQUIRES_APPROVAL",
        message: "wire above $50,000 requires secondary managerial approval",
        standard: "SINA dual-control — secondary approval",
        severity: "escalate",
      },
    ];
  }

  const violations: Violation[] = [];

  // (a) Binding: the approval must be for these exact terms. The hash is
  // recomputed server-side — the streamed `approval.payloadHash` is never trusted.
  if (approval.payloadHash !== payloadHash(coreTerms(data))) {
    violations.push({
      code: "APPROVAL_PAYLOAD_MISMATCH",
      message: "approval does not bind to the submitted transfer terms",
      standard: "SINA dual-control — payload binding",
      severity: "reject",
    });
  }

  // (b) Separation of duties: the approver cannot be the initiator (four-eyes).
  if (approval.approverId === ctx.initiatorId) {
    violations.push({
      code: "SELF_APPROVAL_FORBIDDEN",
      message: "the transfer initiator cannot approve their own wire",
      standard: "SINA dual-control — separation of duties",
      severity: "reject",
    });
  }

  return violations;
}

/**
 * Default-context policy for callers that don't manage identity. Kept for API
 * stability; the emulator uses {@link makeWirePolicy} via {@link evaluateWireTransfer}.
 */
export const wirePolicy = makeWirePolicy({ initiatorId: AGENT_INITIATOR_ID });

/**
 * Never store prohibited card data; keep raw account identifiers and the
 * approver's second factor out of the audit log. The approver id is hashed (a
 * pseudonymous, non-reversible trace) so who-approved-what stays auditable
 * without the audit itself holding a raw identity.
 */
const WIRE_REDACTION: RedactionConfig = {
  drop: [...PROHIBITED_CARD_FIELDS, "secondFactor"],
  hash: ["iban", "accountNumber", "approverId"],
};

/**
 * Evaluate a wire-transfer intent against the constitution (server-side gate +
 * audit). The same entry point handles the initial intent (approval absent →
 * escalate) and an approval-bearing re-submission (bind + separation-of-duties
 * → pass or reject). `ctx.initiatorId` is server-known, never from the payload.
 */
export function evaluateWireTransfer(
  payload: unknown,
  ctx: ApprovalContext = { initiatorId: AGENT_INITIATOR_ID },
): InterceptionResult {
  return intercept(
    {
      schema: approvedWireTransferPayload,
      policy: makeWirePolicy(ctx),
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
