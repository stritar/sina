"use client";

/**
 * SecureWireDialogHost — bridges the emulator's GateTrace to the real
 * `SecureWireDialog` from `@sina-design-system/fintech-react`. It wires the
 * dialog's approval submission to the SERVER re-gate and, on approval, lifts the
 * new decision up to EmulatorShell so the turn's reply swaps from the blocked
 * state to the governed summary. A denied re-gate keeps the dialog open.
 */

import { useRef } from "react";
import {
  SecureWireDialog,
  type SecureWireRegateResult,
  type WireApprovalEvidence,
} from "@sina-design-system/fintech-react";

import { regateWithApproval } from "../_lib/regate";
import type { ConsoleView, GovernedComponentProps } from "@sina-design-system/governance-demo";

export function SecureWireDialogHost({ trace, turnId, onApproved }: GovernedComponentProps) {
  const pending = useRef<ConsoleView | null>(null);

  async function submit(evidence: WireApprovalEvidence): Promise<SecureWireRegateResult> {
    const view = await regateWithApproval(trace.payload, evidence);
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
