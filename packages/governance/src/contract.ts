/**
 * @sina-design-system/governance — the interception contract.
 *
 * The exact surface every domain constitution returns, plus the audit-event
 * shape. Domain-agnostic by design: this file names no limits, currencies, or
 * components — those belong to `fintech`/`defense`.
 */

/** How a violation gates rendering. */
export type Severity =
  /** Hard block — the payload is rejected; nothing renders (the Phase 4 blocked state). */
  | "reject"
  /** Block the standard render and force a governed component instead. */
  | "escalate"
  /** Informational — recorded in the audit trail; does not block. */
  | "flag";

/**
 * The one generic, engine-level code governance itself emits: a Zod parse
 * failure. Domain codes (limits, formats, classifications) are defined by the
 * domain package, keeping domain vocabulary out of this shared layer.
 */
export const SCHEMA_INVALID = "SCHEMA_INVALID";

export interface Violation {
  /** Stable machine code. Domain packages define their own union of these. */
  code: string;
  /** Human-readable explanation of what was violated. */
  message: string;
  /** Path to the offending field, when known. */
  path?: (string | number)[];
  /** Citation for the rule this violates (e.g. "31 CFR 1010.410"). */
  standard?: string;
  severity: Severity;
}

export interface InterceptionResult {
  /** True only when nothing blocks: no `reject` and no `escalate` violation. */
  valid: boolean;
  violations: Violation[];
  /**
   * The governed component SINA forces to render, or null. A bare string at
   * this layer: the domain supplies the concrete name (e.g. "SecureWireDialog").
   */
  requiredComponent: string | null;
}

export interface AuditEvent {
  /** ISO-8601 decision time. */
  timestamp: string;
  /** Correlates this single decision across logs. */
  decisionId: string;
  /** Constitution / rule-set version, so the Phase 10 sink isn't a breaking change. */
  version: string;
  /** The **redacted** payload — sensitive fields are masked/dropped/fingerprinted. */
  payload: unknown;
  result: InterceptionResult;
  violations: Violation[];
  decidedComponent: string | null;
}
