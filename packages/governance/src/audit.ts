/**
 * @sina-design-system/governance — audit emit + payload redaction.
 *
 * Every interception emits a structured {@link AuditEvent}. The sink is a
 * no-op contract stub here; the real sink is wired in Phase 8. Redaction is
 * **mandatory** before emit so the audit trail can never itself store the data
 * the constitution forbids (CVV/PIN under PCI-DSS, raw account numbers/IBANs).
 */

import type { AuditEvent } from "./contract.js";

export type AuditSink = (event: AuditEvent) => void;

const noopSink: AuditSink = () => {};
let sink: AuditSink = noopSink;

/** Install the audit sink (Phase 8 wires the real one; tests inject a spy). */
export function setAuditSink(next: AuditSink): void {
  sink = next;
}

/** Restore the default no-op sink (tests call this in teardown). */
export function resetAuditSink(): void {
  sink = noopSink;
}

/** Emit one audit event to the installed sink. */
export function emitAudit(event: AuditEvent): void {
  sink(event);
}

/**
 * Field-name-based redaction. The domain package supplies the field names
 * (domain knowledge); this layer supplies only the mechanism.
 */
export interface RedactionConfig {
  /** Remove entirely — never stored in any form (CVV, PIN, full track data). */
  drop?: string[];
  /** Keep only the last 4 characters (PAN). */
  mask?: string[];
  /** Replace with a non-reversible fingerprint (IBAN, account number). */
  hash?: string[];
}

/** Redact a payload for audit. Returns a deep copy; the input is untouched. */
export function redact(value: unknown, config?: RedactionConfig): unknown {
  if (!config) return value;
  const drop = toSet(config.drop);
  const mask = toSet(config.mask);
  const hash = toSet(config.hash);
  return walk(value, drop, mask, hash);
}

function toSet(names: string[] | undefined): Set<string> {
  return new Set((names ?? []).map((name) => name.toLowerCase()));
}

function walk(value: unknown, drop: Set<string>, mask: Set<string>, hash: Set<string>): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => walk(item, drop, mask, hash));
  }
  if (value !== null && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(value)) {
      const lower = key.toLowerCase();
      if (drop.has(lower)) continue;
      if (mask.has(lower)) {
        out[key] = maskTail(child);
      } else if (hash.has(lower)) {
        out[key] = fingerprint(child);
      } else {
        out[key] = walk(child, drop, mask, hash);
      }
    }
    return out;
  }
  return value;
}

function maskTail(value: unknown): string {
  return `****${String(value).slice(-4)}`;
}

/**
 * FNV-1a 32-bit fingerprint — non-reversible, **not** cryptographic. Its only
 * job here is to keep raw account numbers/IBANs out of the audit payload at the
 * contract level. Phase 8 swaps this for a keyed hash when the real sink lands.
 */
function fingerprint(value: unknown): string {
  const text = String(value);
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return `fp_${(hash >>> 0).toString(16).padStart(8, "0")}`;
}
