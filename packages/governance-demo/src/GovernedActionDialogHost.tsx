"use client";

/**
 * GovernedActionDialogHost — bridges a `GateTrace` to the shared
 * `GovernedActionDialog` from `@sina-design-system/fintech-react`. It wires the
 * dialog's authorization submission to the SERVER re-gate (through the injected
 * `GateTransport`, keyed by the trace's intent verb) and, on approval, lifts the new
 * decision up so the reply swaps from the blocked state to the governed summary. A
 * denied re-gate keeps the dialog open — the un-bypassable moment.
 */

import { useRef } from "react";
import {
  GovernedActionDialog,
  type GovernedActionEvidence,
  type GovernedActionRegateResult,
} from "@sina-design-system/fintech-react";

import { useGateTransport } from "./TransportProvider.js";
import type { ConsoleView, GovernedComponentProps } from "./types.js";

export function GovernedActionDialogHost({
  trace,
  turnId,
  scenarioId,
  onApproved,
}: GovernedComponentProps) {
  const transport = useGateTransport();
  const pending = useRef<ConsoleView | null>(null);

  async function submit(evidence: GovernedActionEvidence): Promise<GovernedActionRegateResult> {
    const view = await transport.regateAction(
      { intent: trace.intent, payload: trace.payload, scenarioId },
      evidence,
    );
    pending.current = view;
    if (view.kind === "gate") {
      return { approved: view.trace.result.valid, violations: view.trace.result.violations };
    }
    return { approved: false, violations: [] };
  }

  function handleApproved() {
    const view = pending.current;
    if (view && turnId && onApproved) onApproved(turnId, view);
  }

  return (
    <GovernedActionDialog
      intent={trace.payload}
      violations={trace.result.violations}
      onSubmitApproval={submit}
      onApproved={handleApproved}
    />
  );
}
