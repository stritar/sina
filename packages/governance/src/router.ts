/**
 * @sina-design-system/governance — the intent router.
 *
 * The model emits an `{ intent, props }` envelope — an intent VERB, never a
 * component name (ROADMAP §1b: the model emits intent, SINA decides the
 * component). `dispatch` looks the verb up in a domain registry, runs the
 * matching rule through {@link intercept}, and resolves the component to MOUNT:
 * an escalation's forced component, else the rule's default presentational
 * component on a clean pass, else nothing.
 *
 * The {@link InterceptionResult} contract is untouched — mount is resolved
 * here, *outside* it. Domain-agnostic (no currencies, no component names) and
 * server-side only, exactly like `intercept`.
 */

import { intercept, type ConstitutionRule } from "./intercept.js";
import { emitAudit, redact } from "./audit.js";
import type { InterceptionResult, Violation } from "./contract.js";

/** The model's render request: an intent verb + its props. */
export interface IntentEnvelope {
  intent: string;
  props: unknown;
}

/**
 * One registry entry. Either a declarative `rule` (the common case — wrap it
 * with {@link pattern} so its schema type is inferred) or an `evaluate` escape
 * hatch for rules that must bake in server-known context per call (e.g. a wire
 * transfer's initiator id); `evaluate` owns its own `intercept` call + audit
 * emit. `component` is the default presentational mount on a clean pass.
 */
export interface PatternEntry<T = unknown> {
  rule?: ConstitutionRule<T>;
  evaluate?: (props: unknown) => InterceptionResult;
  component?: string | null;
}

/** A domain's intent verb → {@link PatternEntry} map. */
export type PatternRegistry = Record<string, PatternEntry>;

/** The router's decision: the interception result + the resolved mount + props. */
export interface Decision {
  intent: string;
  props: unknown;
  result: InterceptionResult;
  /**
   * The component SINA mounts: a forced escalation, else the rule's default
   * presentational component on a clean pass, else `null` (block / unknown).
   */
  mount: string | null;
}

/** Violation code emitted when no registry entry matches the intent verb. */
export const UNKNOWN_INTENT = "UNKNOWN_INTENT";

/**
 * Type-preserving registry-entry builder. Infers the schema type `T` at the
 * definition site (dodging Zod's invariance when heterogeneous rules share one
 * `Record`), then erases it so the entry stores as {@link PatternEntry}.
 */
export function pattern<T>(entry: PatternEntry<T>): PatternEntry {
  return entry as PatternEntry;
}

let routerDecisionCounter = 0;

function nextDecisionId(): string {
  routerDecisionCounter += 1;
  return `dec_router_${Date.now().toString(36)}_${routerDecisionCounter.toString(36)}`;
}

function unknownIntentResult(intent: string): InterceptionResult {
  const violation: Violation = {
    code: UNKNOWN_INTENT,
    message: `no constitution rule is registered for intent "${intent}"`,
    severity: "reject",
  };
  return { valid: false, violations: [violation], requiredComponent: null };
}

/** Route one envelope through its rule and resolve the mount. Server-side gate. */
export function dispatch(registry: PatternRegistry, envelope: IntentEnvelope): Decision {
  const { intent, props } = envelope;
  const entry = registry[intent];

  if (!entry) {
    // An unroutable intent is still a decision — record it in the audit trail.
    const result = unknownIntentResult(intent);
    emitAudit({
      timestamp: new Date().toISOString(),
      decisionId: nextDecisionId(),
      version: "0.1.0",
      payload: redact(props),
      result,
      violations: result.violations,
      decidedComponent: null,
    });
    return { intent, props, result, mount: null };
  }

  // Rule/`evaluate` entries emit their own audit event inside `intercept`;
  // never double-emit here.
  const result = entry.evaluate ? entry.evaluate(props) : intercept(entry.rule!, props);
  const fallback = entry.component ?? entry.rule?.component ?? null;
  const mount = result.requiredComponent ?? (result.valid ? fallback : null);

  return { intent, props, result, mount };
}

/** Bind a registry into a reusable router: `router(envelope) → Decision`. */
export function createRouter(
  registry: PatternRegistry,
): (envelope: IntentEnvelope) => Decision {
  return (envelope) => dispatch(registry, envelope);
}

/**
 * Route many envelopes — a composed "experience" (e.g. a dashboard). Each is
 * gated + resolved independently, so one blocked intent never sinks the rest.
 */
export function dispatchAll(
  registry: PatternRegistry,
  envelopes: IntentEnvelope[],
): Decision[] {
  return envelopes.map((envelope) => dispatch(registry, envelope));
}
