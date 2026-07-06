"use server";

/**
 * Generalized governed-action re-gate (server-side, §1b). The counterpart to the
 * wire-specific `regate.ts`, for the whole governed family that mounts
 * `GovernedActionDialog` / `MandatoryDisclosure`.
 *
 * Takes the escalated intent verb + payload plus the authorizer's evidence (a
 * second-party approval, a step-up second factor, or a disclosure
 * acknowledgement), rebuilds the payload with a `stepUp` envelope — computing the
 * binding hash HERE, on the server, over the action's terms — and re-runs the
 * exact same constitution via `runGate`. Because the hash is recomputed
 * server-side and never taken from the client, an authorization can only ever
 * bind to the terms actually submitted (authorize a small action, execute a large
 * one → mismatch → reject).
 */

import { actionHash } from "@sina-design-system/fintech";

import { runGate } from "@sina-design-system/governance-demo";
import type { ConsoleView } from "@sina-design-system/governance-demo";

export interface ActionEvidence {
  approverId?: string;
  approverName?: string;
  secondFactor?: string;
  acknowledged?: boolean;
}

export async function regateAction(
  intent: string,
  payload: unknown,
  evidence: ActionEvidence,
): Promise<ConsoleView> {
  const stepUp = {
    ...(evidence.approverId ? { approverId: evidence.approverId } : {}),
    ...(evidence.approverName ? { approverName: evidence.approverName } : {}),
    ...(evidence.secondFactor ? { secondFactor: evidence.secondFactor } : {}),
    ...(evidence.acknowledged ? { acknowledged: true as const } : {}),
    // Server-computed over the action terms — the client's evidence never carries a hash.
    payloadHash: actionHash(payload),
  };
  const merged = { ...(payload as object), stepUp };
  return { kind: "gate", trace: runGate({ intent, props: merged }) };
}
