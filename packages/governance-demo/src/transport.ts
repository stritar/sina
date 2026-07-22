/**
 * The gate transport seam — how a client-side demo reaches the SERVER-side gate.
 *
 * §1b is not negotiable: the constitution runs on a server, and the client only
 * renders the decision it already made. But *which* server differs per host — the
 * playground reaches it through a `"use server"` action, the docs through an Edge
 * Route Handler. That difference is the only thing this interface abstracts.
 *
 * Every method here MUST end in a `runGate` on a server. A transport that gated in
 * the browser would turn the whole demo into the thing it argues against, so there
 * is deliberately no default implementation and no client-side fallback:
 * `useGateTransport()` throws when no provider is installed.
 *
 * The client never computes a binding hash and never authors an envelope — it names
 * a scenario and supplies an approver's evidence. Everything else is the server's.
 */

import type { Scenario } from "./scenarios.js";
import type { ConsoleView } from "./types.js";

/** What a wire approver contributes. Never a hash — the server computes that. */
export interface WireApprovalEvidence {
  approverId: string;
  approverName: string;
  secondFactor?: string;
}

/** Step-up evidence for the generalized governed family + disclosures. */
export interface ActionEvidence {
  approverId?: string;
  approverName?: string;
  secondFactor?: string;
  acknowledged?: boolean;
}

/** Names the escalated terms being re-gated. */
export interface RegateContext {
  /** The intent verb (the action re-gate is keyed by it). */
  intent: string;
  /** The escalated terms. */
  payload: unknown;
  /**
   * Set when this trace came from a canned scenario. A transport that can re-derive
   * the terms server-side from the catalog SHOULD send only this and ignore
   * `payload` — then no client-supplied payload ever reaches the constitution.
   */
  scenarioId?: string;
}

/** The server round-trip the demo runs on. */
export interface GateTransport {
  /** Gate a canned scenario (one envelope, or a composed multi-read experience). */
  runScenario(scenario: Scenario): Promise<ConsoleView>;
  /** Re-gate a wire with a secondary approval. */
  regateWire(context: RegateContext, evidence: WireApprovalEvidence): Promise<ConsoleView>;
  /** Re-gate any other governed action with step-up evidence / an acknowledgement. */
  regateAction(context: RegateContext, evidence: ActionEvidence): Promise<ConsoleView>;
}
