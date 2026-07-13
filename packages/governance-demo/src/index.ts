/**
 * @sina-design-system/governance-demo
 *
 * The deterministic, LLM-free governance demo substrate: the server-side gate seam
 * (`runGate`), the canned scenario catalog, the interception console (the "X-ray") +
 * the governed/ungoverned comparison, the mount registry, and the interactive
 * governed-component hosts. Extracted from the playground so the docs (Phase 7) and
 * the marketing landing (Phase 9) mount the SAME real demo — never a fake, never a
 * duplicate.
 *
 * Boundary note: this is app-support, above the layered libraries. It composes `core`
 * (primitives), `fintech` (the constitution + its fixtures), `governance` (the
 * contract), and `fintech-react` (the governed components the constitution FORCES). It
 * authors no schemas (no `zod`) and it never gates client-side (§1b): the gate and
 * every re-gate — approval, step-up, acknowledgement — run on a **server**, reached
 * through an injected `GateTransport` (a `"use server"` action in the playground, an
 * Edge Route Handler in the docs). The binding hash is always computed server-side; no
 * component ever sends one.
 *
 * A server runtime should import `@sina-design-system/governance-demo/server` instead
 * of this entry — it carries the gate without the React console behind it.
 */

// High-level embed (Server Component — runs the OPENING decision at build, then hands
// off to the client emulator).
export { GovernanceDemo } from "./GovernanceDemo.js";
export type { GovernanceDemoProps } from "./GovernanceDemo.js";

// The runnable emulator.
export { InteractiveDemo } from "./InteractiveDemo.js";
export type { InteractiveDemoProps } from "./InteractiveDemo.js";

// The gate seam (pure) + view model.
export { runGate, runExperience } from "./gate.js";
export type { GateTrace } from "./gate.js";
export { outcomeKind, collectAudits } from "./types.js";
export type {
  ConsoleView,
  TransportError,
  OutcomeKind,
  Turn,
  GovernedComponentProps,
} from "./types.js";

// The server round-trip seam: apps supply the transport, components consume it.
export { GateTransportProvider, useGateTransport } from "./TransportProvider.js";
export type {
  GateTransport,
  RegateContext,
  WireApprovalEvidence,
  ActionEvidence,
} from "./transport.js";

// Canned scenario catalog.
export { SCENARIOS, getScenario, resolveScenarios } from "./scenarios.js";
export type { Scenario, Expectation } from "./scenarios.js";

// Formatting helpers.
export { formatAmount, pretty } from "./format.js";

// The mount seam: the decision the gate made → the component it mounts.
export { resolveGovernedComponent, resolvePresentational } from "./registry.js";
export { GateReply, isReadReply } from "./GateReply.js";
export type { GateReplyProps } from "./GateReply.js";
export { BlockedState } from "./BlockedState.js";

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
