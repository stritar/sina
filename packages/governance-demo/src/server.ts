/**
 * @sina-design-system/governance-demo/server
 *
 * The server half of the demo: the gate, the re-gates, and the canned scenario
 * catalog. **Imports no React** — deliberately.
 *
 * This entry exists so a server runtime can reach the constitution without dragging
 * the console UI in behind it. The docs' Edge Route Handler imports from here; if it
 * imported the package index instead, React, Radix and every console component would
 * be bundled into the Cloudflare worker, which has a 1 MiB compressed ceiling. That
 * failure shows up as a *deploy* failure, and a failed Cloudflare build silently
 * keeps serving the previous site — so the split is structural, not a convention.
 */

export { runGate, runExperience } from "./gate.js";
export type { GateTrace } from "./gate.js";

export { regateWireApproval, regateGovernedAction } from "./regate.js";

export { SCENARIOS, getScenario } from "./scenarios.js";
export type { Scenario, Expectation } from "./scenarios.js";

export { outcomeKind } from "./types.js";
export type { ConsoleView, TransportError, OutcomeKind } from "./types.js";

export type { ActionEvidence, WireApprovalEvidence, RegateContext } from "./transport.js";
