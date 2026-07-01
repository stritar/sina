/**
 * The emulator gate seam — the design-independent heart of the console.
 *
 * Routes an intent envelope through the fintech constitution server-side
 * (validate, *then* mount — ROADMAP §1b), tees the real audit event the
 * governance layer emits, measures gate latency, and splits the result into the
 * stages the interception console renders. Pure logic: no React, no UI, no model.
 * The server actions and the CI suite both call this, so the demo and the proof
 * exercise the same path — governed wires and ungoverned reads alike.
 */

import { evaluateFintechIntent } from "@sina-design-system/fintech";
import {
  resetAuditSink,
  SCHEMA_INVALID,
  setAuditSink,
  type AuditEvent,
  type Decision,
  type IntentEnvelope,
  type InterceptionResult,
  type Violation,
} from "@sina-design-system/governance";

export interface GateTrace {
  /** The intent verb the envelope carried (e.g. `wire_transfer`, `list_transactions`). */
  intent: string;
  /** The validated props (the model's proposed payload for this intent). */
  payload: unknown;
  /** The interception decision: `{ valid, violations, requiredComponent }`. */
  result: InterceptionResult;
  /** What SINA mounts: a presentational component on a clean pass, the forced
   * governed component on escalation, or null (a plain block / unknown intent). */
  mount: string | null;
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
 * Route one intent envelope through the constitution and capture everything the
 * console needs.
 *
 * `evaluateFintechIntent` is synchronous and emits its audit event synchronously,
 * so installing the sink, calling it, and resetting all happen within one
 * uninterrupted tick — there is no `await` between `setAuditSink` and
 * `resetAuditSink`, so concurrent requests cannot bleed into each other despite
 * the sink being a module global.
 */
export function runGate(envelope: IntentEnvelope): GateTrace {
  let audit: AuditEvent | null = null;
  setAuditSink((event) => {
    audit = event;
  });

  const start = performance.now();
  let decision: Decision;
  try {
    decision = evaluateFintechIntent(envelope);
  } finally {
    resetAuditSink();
  }
  const latencyMs = performance.now() - start;

  const { result, mount, props } = decision;
  const schemaViolations = result.violations.filter((v) => v.code === SCHEMA_INVALID);
  const policyViolations = result.violations.filter((v) => v.code !== SCHEMA_INVALID);

  return {
    intent: envelope.intent,
    payload: props,
    result,
    mount,
    audit,
    latencyMs,
    schemaViolations,
    policyViolations,
  };
}

/**
 * Route a composed "experience" — several intents from one prompt (a dashboard).
 * Each envelope is gated independently (its own audit), so one blocked item never
 * sinks the rest. Uses the router's per-intent `Decision`; no contract change.
 */
export function runExperience(envelopes: IntentEnvelope[]): GateTrace[] {
  return envelopes.map((envelope) => runGate(envelope));
}
