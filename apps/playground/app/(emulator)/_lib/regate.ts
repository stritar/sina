"use server";

/**
 * Secondary-approval re-gate (server-side, §1b). Takes the original escalated
 * intent plus the approver's evidence, rebuilds the approval-bearing payload —
 * computing the binding hash HERE, on the server, over the intent's core terms —
 * and re-runs the exact same constitution via `runGate`.
 *
 * Because the hash is recomputed server-side and never taken from the client, an
 * approval can only ever bind to the terms actually submitted: approving $5k and
 * executing $60k produces a mismatch and is rejected.
 */

import { coreTerms, payloadHash, INTENTS } from "@sina-design-system/fintech";

import { runGate } from "@sina-design-system/governance-demo";
import type { ConsoleView } from "@sina-design-system/governance-demo";

interface ApprovalEvidence {
  approverId: string;
  approverName: string;
  secondFactor?: string;
}

export async function regateWithApproval(
  intent: unknown,
  evidence: ApprovalEvidence,
): Promise<ConsoleView> {
  const approved = {
    ...(intent as object),
    approval: {
      approverId: evidence.approverId,
      approverName: evidence.approverName,
      ...(evidence.secondFactor ? { secondFactor: evidence.secondFactor } : {}),
      // Server-computed — the client's evidence never carries a hash.
      payloadHash: payloadHash(coreTerms(intent)),
    },
  };
  return { kind: "gate", trace: runGate({ intent: INTENTS.WIRE_TRANSFER, props: approved }) };
}
