"use client";

/**
 * The playground's `GateTransport` — the server seam the governed hosts re-gate
 * across.
 *
 * Here that seam is a Next `"use server"` action: the reference is serializable, so a
 * client component can hold it and call it, and the constitution still only ever runs
 * on the server. (The docs implement the same interface over an Edge Route Handler.)
 *
 * The playground trusts its own payload — it is a local sandbox where hand-authored
 * "direct" envelopes are the point, so `regate*` forwards `context.payload` rather
 * than re-deriving it from the scenario catalog. The public docs endpoint deliberately
 * does the opposite.
 */

import type {
  ActionEvidence,
  ConsoleView,
  GateTransport,
  RegateContext,
  Scenario,
  WireApprovalEvidence,
} from "@sina-design-system/governance-demo";

import { gateExperience, gateIntent } from "./run-emulator";
import { regateWithApproval } from "./regate";
import { regateAction } from "./regate-action";

export const playgroundTransport: GateTransport = {
  runScenario(scenario: Scenario): Promise<ConsoleView> {
    const { envelopes } = scenario;
    return envelopes ? gateExperience(envelopes) : gateIntent(scenario.envelope);
  },

  regateWire(context: RegateContext, evidence: WireApprovalEvidence): Promise<ConsoleView> {
    return regateWithApproval(context.payload, evidence);
  },

  regateAction(context: RegateContext, evidence: ActionEvidence): Promise<ConsoleView> {
    return regateAction(context.intent, context.payload, evidence);
  },
};
