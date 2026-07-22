/**
 * @sina-design-system/governance
 *
 * The shared interception seam: the contract every domain constitution returns
 * ({ valid, violations, requiredComponent }), the audit emit point, and the
 * `intercept` engine that runs a Zod schema + policy rules server-side and
 * decides what may render. Domain-agnostic — no React, no UI, no domain
 * vocabulary; `fintech`/`defense` supply the rules and the component names.
 */

export type { Severity, Violation, InterceptionResult, AuditEvent } from "./contract.js";
export { SCHEMA_INVALID } from "./contract.js";
export {
  setAuditSink,
  resetAuditSink,
  emitAudit,
  redact,
  type AuditSink,
  type RedactionConfig,
} from "./audit.js";
export { intercept, type ConstitutionRule } from "./intercept.js";
export {
  uncitedStandards,
  uncataloguedCitations,
  type Standard,
  type StandardTier,
} from "./standards.js";
export {
  dispatch,
  dispatchAll,
  createRouter,
  pattern,
  UNKNOWN_INTENT,
  type IntentEnvelope,
  type PatternEntry,
  type PatternRegistry,
  type Decision,
} from "./router.js";
