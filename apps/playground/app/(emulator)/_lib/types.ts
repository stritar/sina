/**
 * Shared view-model the emulator panes render from. One `ConsoleView` drives both
 * the console (the X-ray) and the chat (the mounted reply) — the server decides,
 * the client renders the decision (§1b: validate, then mount).
 */

import type { GateTrace } from "./gate";

/** Model/transport failures — distinct from a governance block. */
export interface TransportError {
  reason: "malformed" | "refusal" | "rate-limit" | "error";
  message: string;
}

export type ConsoleView =
  | { kind: "idle" }
  | { kind: "gate"; trace: GateTrace }
  | { kind: "experience"; traces: GateTrace[] }
  | { kind: "transport"; error: TransportError };

export type OutcomeKind = "governed" | "blocked" | "transport";

export function outcomeKind(view: ConsoleView): OutcomeKind | null {
  if (view.kind === "transport") return "transport";
  if (view.kind === "gate") return view.trace.result.valid ? "governed" : "blocked";
  if (view.kind === "experience")
    return view.traces.every((trace) => trace.result.valid) ? "governed" : "blocked";
  return null;
}

/** One conversational turn: the user's prompt and the governed reply. */
export interface Turn {
  id: string;
  prompt: string;
  view: ConsoleView;
  streaming?: boolean;
}

/**
 * The uniform contract for a component the gate FORCES (`requiredComponent`).
 * The registry maps a `requiredComponent` name to a component of this shape, so
 * Phase 6 can add governed components without rewiring BlockedState. A component
 * that resolves an interactive re-gate (e.g. approval) lifts the new decision up
 * via `onApproved` so the turn's reply can swap to the governed summary.
 */
export interface GovernedComponentProps {
  trace: GateTrace;
  turnId?: string;
  onApproved?: (turnId: string, view: ConsoleView) => void;
}
