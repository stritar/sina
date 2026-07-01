/**
 * The emulator gate seam — the design-independent heart of the Phase 4 console.
 *
 * Runs the wire-transfer constitution server-side (validate, *then* mount —
 * ROADMAP §1b), tees the real audit event the governance layer emits, measures
 * gate latency, and splits the result into the stages the interception console
 * renders. Pure logic: no React, no UI, no model. The streamUI server action and
 * the CI suite both call this, so the demo and the proof exercise the same path.
 */

import { evaluateWireTransfer } from "@sina-design-system/fintech";
import {
  resetAuditSink,
  SCHEMA_INVALID,
  setAuditSink,
  type AuditEvent,
  type InterceptionResult,
  type Violation,
} from "@sina-design-system/governance";

export interface GateTrace {
  /** The raw intent that arrived (the model's proposed payload). */
  payload: unknown;
  /** The interception decision: `{ valid, violations, requiredComponent }`. */
  result: InterceptionResult;
  /** The actual emitted audit event — already redacted (CVV dropped, IBAN hashed). */
  audit: AuditEvent | null;
  /** Server-side gate latency in milliseconds. */
  latencyMs: number;
  /** Structural / format failures (the schema-gate stage). */
  schemaViolations: Violation[];
  /** Cited regulatory / limit violations (the policy stage). */
  policyViolations: Violation[];
}

/**
 * Run one intent through the constitution and capture everything the console
 * needs.
 *
 * `evaluateWireTransfer` is synchronous and emits its audit event synchronously,
 * so installing the sink, calling it, and resetting all happen within one
 * uninterrupted tick — there is no `await` between `setAuditSink` and
 * `resetAuditSink`, so concurrent requests cannot bleed into each other despite
 * the sink being a module global.
 */
export function runGate(payload: unknown): GateTrace {
  let audit: AuditEvent | null = null;
  setAuditSink((event) => {
    audit = event;
  });

  const start = performance.now();
  let result: InterceptionResult;
  try {
    result = evaluateWireTransfer(payload);
  } finally {
    resetAuditSink();
  }
  const latencyMs = performance.now() - start;

  const schemaViolations = result.violations.filter((v) => v.code === SCHEMA_INVALID);
  const policyViolations = result.violations.filter((v) => v.code !== SCHEMA_INVALID);

  return { payload, result, audit, latencyMs, schemaViolations, policyViolations };
}
