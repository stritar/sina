"use client";

/**
 * SecureWireDialogHost — bridges a `GateTrace` to the real `SecureWireDialog` from
 * `@sina-design-system/fintech-react`. It wires the dialog's approval submission to
 * the SERVER re-gate (through the injected `GateTransport`) and, on approval, lifts
 * the new decision up so the reply swaps from the blocked state to the governed
 * summary. A denied re-gate keeps the dialog open — the un-bypassable moment.
 *
 * The dialog never learns whether the approval was good; it asks the server and
 * renders the answer.
 */

import { useRef } from "react";
import {
  SecureWireDialog,
  type SecureWireRegateResult,
  type WireApprovalEvidence,
} from "@sina-design-system/fintech-react";

import { useGateTransport } from "./TransportProvider.js";
import type { ConsoleView, GovernedComponentProps } from "./types.js";

export function SecureWireDialogHost({
  trace,
  turnId,
  scenarioId,
  onApproved,
}: GovernedComponentProps) {
  const transport = useGateTransport();
  const pending = useRef<ConsoleView | null>(null);

  async function submit(evidence: WireApprovalEvidence): Promise<SecureWireRegateResult> {
    const view = await transport.regateWire(
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
    <SecureWireDialog
      intent={trace.payload}
      violations={trace.result.violations}
      onSubmitApproval={submit}
      onApproved={handleApproved}
    />
  );
}
