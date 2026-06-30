/**
 * @sina-design-system/governance — the interception engine.
 *
 * `intercept` is the single seam every domain constitution calls. It runs a
 * Zod schema (the structural/format gate) plus optional post-parse policy
 * rules (limits, classifications), resolves the governed component, emits a
 * redacted audit event, and returns the {@link InterceptionResult}. Validation
 * runs **server-side only** (ROADMAP §1b: validate, then mount).
 */

import type { ZodIssue, ZodType } from "zod";
import { SCHEMA_INVALID, type InterceptionResult, type Violation } from "./contract.js";
import { emitAudit, redact, type RedactionConfig } from "./audit.js";

export interface ConstitutionRule<T> {
  /** The Zod schema enforcing structure + format (the parse gate). */
  schema: ZodType<T>;
  /** Post-parse policy checks producing limit/classification violations. */
  policy?: (data: T) => Violation[];
  /** Map an `escalate` violation's `code` → the governed component to force. */
  escalations?: Record<string, string>;
  /** Field names to redact from the audited payload (domain supplies these). */
  redaction?: RedactionConfig;
  /** Constitution version stamped onto the audit event. */
  version?: string;
}

let decisionCounter = 0;

function nextDecisionId(): string {
  decisionCounter += 1;
  return `dec_${Date.now().toString(36)}_${decisionCounter.toString(36)}`;
}

function zodIssueToViolation(issue: ZodIssue): Violation {
  return {
    code: SCHEMA_INVALID,
    message: issue.message,
    path: issue.path,
    severity: "reject",
  };
}

function resolveRequiredComponent(
  violations: Violation[],
  escalations: Record<string, string> | undefined,
): string | null {
  if (!escalations) return null;
  for (const violation of violations) {
    if (violation.severity !== "escalate") continue;
    const component = escalations[violation.code];
    if (component) return component;
  }
  return null;
}

/** Evaluate a payload against a constitution rule. Server-side gate + audit. */
export function intercept<T>(rule: ConstitutionRule<T>, payload: unknown): InterceptionResult {
  const parsed = rule.schema.safeParse(payload);

  const violations: Violation[] = parsed.success
    ? (rule.policy?.(parsed.data) ?? [])
    : parsed.error.issues.map(zodIssueToViolation);

  const requiredComponent = resolveRequiredComponent(violations, rule.escalations);
  const valid = !violations.some(
    (violation) => violation.severity === "reject" || violation.severity === "escalate",
  );

  const result: InterceptionResult = { valid, violations, requiredComponent };

  emitAudit({
    timestamp: new Date().toISOString(),
    decisionId: nextDecisionId(),
    version: rule.version ?? "0.1.0",
    payload: redact(payload, rule.redaction),
    result,
    violations,
    decidedComponent: requiredComponent,
  });

  return result;
}
