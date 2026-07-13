/**
 * The re-gate seam — an escalated action, plus an authorizer's evidence, run back
 * through the SAME constitution.
 *
 * These are pure functions with no `"use server"` directive: they are the *body* a
 * server entry point calls, not the entry point itself. The playground wraps them in
 * a server action; the docs call them from an Edge Route Handler. The client only
 * ever reaches them through a {@link GateTransport}.
 *
 * The binding hash is computed HERE — server-side, over the terms actually submitted
 * — and is never taken from the client. That is what makes an authorization bind to
 * one specific action: approve $5k and execute $60k and the hashes disagree, so the
 * constitution rejects it.
 */

import { INTENTS, actionHash, coreTerms, payloadHash } from "@sina-design-system/fintech";

import { runGate } from "./gate.js";
import type { ActionEvidence, WireApprovalEvidence } from "./transport.js";
import type { ConsoleView } from "./types.js";

/** Re-gate a wire with a secondary approval (the four-eyes path). */
export function regateWireApproval(
  payload: unknown,
  evidence: WireApprovalEvidence,
): ConsoleView {
  const approved = {
    ...(payload as object),
    approval: {
      approverId: evidence.approverId,
      approverName: evidence.approverName,
      ...(evidence.secondFactor ? { secondFactor: evidence.secondFactor } : {}),
      // Server-computed over the submitted core terms — never sent by the client.
      payloadHash: payloadHash(coreTerms(payload)),
    },
  };
  return { kind: "gate", trace: runGate({ intent: INTENTS.WIRE_TRANSFER, props: approved }) };
}

/**
 * Re-gate any other governed action — a step-up second factor, a second-party
 * approval, or a disclosure acknowledgement — keyed by the action's own intent verb.
 */
export function regateGovernedAction(
  intent: string,
  payload: unknown,
  evidence: ActionEvidence,
): ConsoleView {
  const stepUp = {
    ...(evidence.approverId ? { approverId: evidence.approverId } : {}),
    ...(evidence.approverName ? { approverName: evidence.approverName } : {}),
    ...(evidence.secondFactor ? { secondFactor: evidence.secondFactor } : {}),
    ...(evidence.acknowledged ? { acknowledged: true as const } : {}),
    // Server-computed over the action's terms — never sent by the client.
    payloadHash: actionHash(payload),
  };
  return {
    kind: "gate",
    trace: runGate({ intent, props: { ...(payload as object), stepUp } }),
  };
}
