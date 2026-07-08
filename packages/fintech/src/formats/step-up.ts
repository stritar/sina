/**
 * Step-up authorization — the shared dual-control envelope every governed action
 * carries to clear its escalation.
 *
 * This generalizes the wire-transfer secondary-approval loop (`wire-transfer`
 * remains its own bespoke schema, byte-stable) so the rest of the governed family
 * — payments, card ops, security changes, trades, disclosures — reuses ONE
 * mechanism instead of re-authoring dual-control per flow. Above its threshold a
 * governed policy calls {@link stepUpViolations}; absent a sufficient step-up it
 * escalates (forcing the governed component), and for a second-approver flow it
 * hard-rejects a mismatched binding or a self-approval (four-eyes).
 *
 * The binding hash is recomputed server-side over the action terms (the payload
 * minus its `stepUp`) and never trusted from the stream — a hostile stream that
 * authorizes $5k but executes $60k produces a mismatch and is rejected.
 */

import { z } from "zod";
import type { Violation } from "@sina-design-system/governance";

import { canonicalize } from "./canonical.js";

/**
 * How a governed action's escalation is cleared:
 *   - `approval` — a *second* party authorizes it (four-eyes: binding hash +
 *     separation of duties), like a large wire.
 *   - `second-factor` — the actor re-authenticates with a one-time code (a
 *     sensitive change: PIN, add user, close account).
 *   - `acknowledge` — the actor attests they have read a mandatory disclosure.
 */
export type StepUpMode = "approval" | "second-factor" | "acknowledge";

/**
 * Server-supplied evaluation identity. The initiator is **never** a payload field
 * — the model *is* the initiator, so a streamed `initiatorId` could satisfy its
 * own four-eyes check. A real deployment passes the session identity.
 */
export interface ActionContext {
  initiatorId: string;
}

/** The emulator's stand-in initiator — the agent that emitted the intent. */
export const ACTION_INITIATOR_ID = "agent:opus";

/**
 * The step-up envelope. Every field is optional at the schema layer (so an
 * un-authorized intent still parses and escalates); {@link stepUpViolations}
 * enforces which fields a given {@link StepUpMode} actually requires. `.strict()`
 * so a key smuggled *inside* the envelope is rejected like any other fabricated field.
 */
export const stepUpApproval = z
  .object({
    /** A second approver's identity (approval mode); checked against the server-known initiator. */
    approverId: z.string().min(1).optional(),
    approverName: z.string().min(1).optional(),
    /** A 6-digit one-time code (approval / second-factor modes). */
    secondFactor: z.string().regex(/^\d{6}$/, "second factor must be a 6-digit code").optional(),
    /** The actor has read + accepted the required disclosure (acknowledge mode). */
    acknowledged: z.literal(true).optional(),
    /** Binds this authorization to the exact action terms; recomputed server-side, never trusted. */
    payloadHash: z.string().min(1).optional(),
    /** Reserved for Phase 10 freshness / replay checks (no server challenge store yet). */
    challengeId: z.string().optional(),
  })
  .strict();

export type StepUpApproval = z.infer<typeof stepUpApproval>;

/** What the caller declares when an action crosses its threshold. */
export interface StepUpRequirement {
  /** Which step-up mode clears this escalation. */
  mode: StepUpMode;
  /** The escalate code emitted when step-up is absent — its `escalations` entry maps to the component. */
  code: string;
  /** Human-readable reason (shown as a citation in the governed dialog). */
  message: string;
  /** The cited standard / policy this enforces. */
  standard: string;
}

/**
 * The action's binding terms = the payload minus its `stepUp` envelope, so
 * `actionHash(x)` is stable whether or not `x` already carries a step-up. FNV-1a
 * via the shared {@link canonicalize} (deterministic; non-cryptographic — Phase 10
 * swaps in a keyed hash).
 */
export function actionHash(payload: unknown): string {
  const terms =
    payload !== null && typeof payload === "object" && !Array.isArray(payload)
      ? stripStepUp(payload as Record<string, unknown>)
      : payload;
  const text = canonicalize(terms);
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return `fp_${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function stripStepUp(data: Record<string, unknown>): Record<string, unknown> {
  const { stepUp: _stepUp, ...rest } = data;
  return rest;
}

function providesMode(s: StepUpApproval, mode: StepUpMode): boolean {
  if (mode === "acknowledge") return s.acknowledged === true;
  if (mode === "second-factor") return typeof s.secondFactor === "string";
  // approval: a second party, a one-time code, AND a binding hash.
  return Boolean(s.approverId && s.approverName && s.secondFactor && s.payloadHash);
}

/**
 * The shared dual-control gate. Call it from a governed policy once the action is
 * over its threshold:
 *   - no (or insufficient) step-up → a single `escalate` violation (forces the
 *     governed component),
 *   - approval mode with a step-up → verify the binding hash + separation of
 *     duties, each a hard `reject` on failure (the un-bypassable moment).
 */
export function stepUpViolations(
  data: Record<string, unknown> & { stepUp?: StepUpApproval },
  ctx: ActionContext,
  req: StepUpRequirement,
): Violation[] {
  const { stepUp } = data;

  if (!stepUp || !providesMode(stepUp, req.mode)) {
    return [{ code: req.code, message: req.message, standard: req.standard, severity: "escalate" }];
  }

  if (req.mode !== "approval") return [];

  const violations: Violation[] = [];

  // (a) Binding: the authorization must be for these exact terms. Recomputed
  // server-side — the streamed `payloadHash` is never trusted.
  if (stepUp.payloadHash !== actionHash(data)) {
    violations.push({
      code: "APPROVAL_PAYLOAD_MISMATCH",
      message: "authorization does not bind to the submitted action terms",
      standard: "SINA dual-control — payload binding",
      severity: "reject",
    });
  }

  // (b) Separation of duties: the approver cannot be the initiator (four-eyes).
  if (stepUp.approverId && stepUp.approverId === ctx.initiatorId) {
    violations.push({
      code: "SELF_APPROVAL_FORBIDDEN",
      message: "the initiator cannot approve their own action",
      standard: "SINA dual-control — separation of duties",
      severity: "reject",
    });
  }

  return violations;
}
