/**
 * Canonical serialization + a deterministic binding hash for approval terms.
 *
 * Secondary approval is bound to the *exact* transfer it approved: the gate
 * recomputes {@link payloadHash} over the submitted {@link coreTerms} and
 * compares it to `approval.payloadHash`. A hostile stream that approves a $5k
 * wire but executes $60k produces a hash mismatch and is rejected server-side.
 *
 * The hash is FNV-1a 32-bit — non-reversible, **not** cryptographic. Like the
 * audit fingerprint it only needs to be stable and collision-resistant enough
 * to bind terms; Phase 10 swaps in a keyed hash with the real sink. Everything
 * here is deterministic (no `Date.now`/`Math.random`) so the same terms always
 * hash the same, in tests and at runtime.
 */

/** Deep, key-sorted JSON so object key order can never change the hash. */
export function canonicalize(value: unknown): string {
  return JSON.stringify(sortDeep(value));
}

function sortDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortDeep);
  if (value !== null && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      out[key] = sortDeep((value as Record<string, unknown>)[key]);
    }
    return out;
  }
  return value;
}

/** A non-reversible fingerprint of the canonical terms. Binds an approval to a payload. */
export function payloadHash(value: unknown): string {
  const text = canonicalize(value);
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return `fp_${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

/**
 * The transfer's "core terms" = the payload minus its `approval` envelope. This
 * is what an approval binds to, so `payloadHash(coreTerms(x))` is stable whether
 * or not `x` already carries an approval.
 */
export function coreTerms(payload: unknown): unknown {
  if (payload === null || typeof payload !== "object" || Array.isArray(payload)) return payload;
  const { approval: _approval, ...rest } = payload as Record<string, unknown>;
  return rest;
}
