"use server";

/**
 * Secondary-approval re-gate, exposed to the client as a server action (§1b).
 *
 * The body lives in `@sina-design-system/governance-demo/server` (`regateWireApproval`)
 * so the playground and the docs re-gate through the SAME code — the binding hash is
 * computed there, server-side, over the terms actually submitted, and is never taken
 * from the client. Approve $5k, execute $60k → the hashes disagree → rejected.
 *
 * This file is only the transport: it is the `"use server"` boundary the playground's
 * `GateTransport` calls across. The docs cross the same seam through an Edge Route
 * Handler instead.
 */

import { regateWireApproval } from "@sina-design-system/governance-demo/server";
import type {
  ConsoleView,
  WireApprovalEvidence,
} from "@sina-design-system/governance-demo/server";

export async function regateWithApproval(
  intent: unknown,
  evidence: WireApprovalEvidence,
): Promise<ConsoleView> {
  return regateWireApproval(intent, evidence);
}
