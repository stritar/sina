"use client";

/**
 * MandatoryDisclosureHost — bridges the emulator's GateTrace to the
 * `MandatoryDisclosure` component. It submits the acknowledgement to the SERVER
 * re-gate (`regateAction`) and, on acceptance, lifts the new decision up to
 * EmulatorShell. A denied re-gate keeps the disclosure blocked.
 */

import { useRef } from "react";
import {
  MandatoryDisclosure,
  type DisclosureAcknowledgement,
  type GovernedActionRegateResult,
} from "@sina-design-system/fintech-react";

import { regateAction } from "../_lib/regate-action";
import type { ConsoleView, GovernedComponentProps } from "@sina-design-system/governance-demo";

export function MandatoryDisclosureHost({ trace, turnId, onApproved }: GovernedComponentProps) {
  const pending = useRef<ConsoleView | null>(null);

  async function submit(evidence: DisclosureAcknowledgement): Promise<GovernedActionRegateResult> {
    const view = await regateAction(trace.intent, trace.payload, evidence);
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
