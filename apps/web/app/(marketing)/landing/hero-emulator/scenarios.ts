/**
 * Scenario resolution for the hero emulator: one map from industry to its chip
 * set, plus the canned-trace lookup that powers the server-rendered static
 * frame and the auto-play loop (zero network; deterministic latency). Fintech's
 * canned results mirror the real gate; a user-initiated fintech run still goes
 * through emulator/transport.ts to /api/gate.
 */

import type { Industry } from "../copy";
import { FINTECH_CANNED, FINTECH_SCENARIOS } from "../emulator/fintech";
import { DEFENSE_SCENARIOS, HEALTHCARE_SCENARIOS, cannedTrace } from "../emulator/simulated";
import type { EmulatorScenario, EmulatorTrace, SimulatedScenario } from "../emulator/types";

/** Each set opens with its escalation money shot, so index 0 is the default. */
export const SCENARIO_SETS: Record<Industry, readonly EmulatorScenario[]> = {
  fintech: FINTECH_SCENARIOS,
  healthcare: HEALTHCARE_SCENARIOS,
  defense: DEFENSE_SCENARIOS,
};

export function isSimulated(scenario: EmulatorScenario): scenario is SimulatedScenario {
  return "result" in scenario;
}

/**
 * The two-turn hero story per industry: a routine ask that PASSES, then a
 * high-risk ask that ESCALATES to a governed dialog. Fintech's escalation
 * forces the real SecureWireDialog; healthcare/defense name a governed dialog
 * that is (openly) a simulation. Ids resolve against SCENARIO_SETS.
 */
const HERO_PAIR_IDS: Record<Industry, readonly [pass: string, block: string]> = {
  fintech: ["small", "over-limit"],
  healthcare: ["medication-list", "high-dose-order"],
  defense: ["convoy-manifest", "munitions-transfer"],
};

export function heroPairFor(industry: Industry): readonly [EmulatorScenario, EmulatorScenario] {
  const [passId, blockId] = HERO_PAIR_IDS[industry];
  const set = SCENARIO_SETS[industry];
  const pass = set.find((s) => s.id === passId);
  const block = set.find((s) => s.id === blockId);
  if (!pass || !block) throw new Error(`Missing hero pair for ${industry}: ${passId}/${blockId}`);
  return [pass, block];
}

/** The deterministic canned trace for any scenario, in any industry. */
export function cannedFor(scenario: EmulatorScenario): EmulatorTrace {
  const result = isSimulated(scenario)
    ? scenario.result
    : (FINTECH_CANNED[scenario.id] ?? { verdict: "pass" as const, mount: null, violations: [] });
  return cannedTrace(scenario, result);
}
