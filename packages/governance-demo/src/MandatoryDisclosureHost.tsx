"use client";

/**
 * MandatoryDisclosureHost — bridges a `GateTrace` to the `MandatoryDisclosure`
 * component. It submits the acknowledgement to the SERVER re-gate (through the
 * injected `GateTransport`) and, on acceptance, lifts the new decision up. A denied
 * re-gate keeps the disclosure blocked.
 */

import { useRef } from "react";
import {
  MandatoryDisclosure,
  type DisclosureAcknowledgement,
  type GovernedActionRegateResult,
} from "@sina-design-system/fintech-react";

import { useGateTransport } from "./TransportProvider.js";
import type { ConsoleView, GovernedComponentProps } from "./types.js";

export function MandatoryDisclosureHost({
  trace,
  turnId,
  scenarioId,
  onApproved,
}: GovernedComponentProps) {
  const transport = useGateTransport();
  const pending = useRef<ConsoleView | null>(null);

  async function submit(evidence: DisclosureAcknowledgement): Promise<GovernedActionRegateResult> {
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
    <MandatoryDisclosure
      intent={trace.payload}
      violations={trace.result.violations}
      onSubmitApproval={submit}
      onApproved={handleApproved}
    />
  );
}
