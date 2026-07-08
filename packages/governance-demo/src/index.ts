/**
 * @sina-design-system/governance-demo
 *
 * The deterministic, LLM-free governance demo substrate: the server-side gate
 * seam (`runGate`), the canned scenario catalog, and the read-only interception
 * console (the "X-ray") + the governed/ungoverned comparison. Extracted from the
 * playground so the docs (Phase 7) and the marketing landing (Phase 9) mount the
 * SAME real demo — never a fake, never a duplicate.
 *
 * Boundary note: this is app-support, above the layered libraries. It composes
 * `core` + `fintech` + `governance` and RENDERS decisions the constitution made;
 * it authors no schemas (no `zod`) and never validates client-side (§1b). The
 * interactive re-gate flows (approval / step-up) live in the playground.
 */

// High-level embed (Server Component — runs the gate at build).
export { GovernanceDemo } from "./GovernanceDemo.js";
export type { GovernanceDemoProps } from "./GovernanceDemo.js";

// The gate seam (pure) + view model.
export { runGate, runExperience } from "./gate.js";
export type { GateTrace } from "./gate.js";
export {
  outcomeKind,
} from "./types.js";
export type {
  ConsoleView,
  TransportError,
  OutcomeKind,
  Turn,
  GovernedComponentProps,
} from "./types.js";

// Canned scenario catalog.
export { SCENARIOS, getScenario } from "./scenarios.js";
export type { Scenario, Expectation } from "./scenarios.js";

// Formatting helpers.
export { formatAmount, pretty } from "./format.js";

// Presentational console components (read-only).
export { ConsoleTimeline } from "./ConsoleTimeline.js";
export { ConsoleStage } from "./ConsoleStage.js";
export { DecisionSummary } from "./DecisionSummary.js";
export { ServerBoundary } from "./ServerBoundary.js";
export { AuditLedger } from "./AuditLedger.js";
export { CodeBlock } from "./CodeBlock.js";
export { ComparisonToggle } from "./ComparisonToggle.js";
export { GovernedWireSummary } from "./GovernedWireSummary.js";
export { TransportState } from "./TransportState.js";
