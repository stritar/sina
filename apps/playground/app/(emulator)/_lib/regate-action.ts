"use server";

/**
 * Generalized governed-action re-gate, exposed as a server action (§1b). The
 * counterpart to the wire-specific `regate.ts`, for the whole governed family that
 * mounts `GovernedActionDialog` / `MandatoryDisclosure`.
 *
 * The body lives in `@sina-design-system/governance-demo/server`
 * (`regateGovernedAction`): it rebuilds the payload with a `stepUp` envelope and
 * computes the binding hash there, server-side, over the action's terms. Because the
 * hash is never taken from the client, an authorization can only bind to the terms
 * actually submitted — authorize a small action, execute a large one → mismatch →
 * reject. This file is only the `"use server"` boundary.
 */

import { regateGovernedAction } from "@sina-design-system/governance-demo/server";
import type { ActionEvidence, ConsoleView } from "@sina-design-system/governance-demo/server";

export async function regateAction(
  intent: string,
  payload: unknown,
  evidence: ActionEvidence,
): Promise<ConsoleView> {
  return regateGovernedAction(intent, payload, evidence);
}
