/**
 * USD scope flag — the loud version of the USD-only policy bands.
 *
 * Every money-movement policy in this constitution defines its amount bands in
 * USD (FX equivalence is out of scope; see `thresholds.ts`). A non-USD payload
 * still passes format validation, but instead of returning silently — the
 * "€60,000 wire, zero violations" failure mode — the policy records ONE
 * informational `flag` violation stating that no amount band was evaluated.
 * `flag` never blocks (`valid` stays true, nothing escalates); it exists so the
 * audit trail and the caller can see the pass was format-only. An integrator
 * outside USD chains their own bands after the stock policy (see the
 * "write a governance rule" guide).
 */

import type { Violation } from "@sina-design-system/governance";

/** Machine code shared by every USD-scoped policy for its non-USD flag. */
export const POLICY_BANDS_NOT_EVALUATED = "POLICY_BANDS_NOT_EVALUATED";

/** The cited policy string — must stay in lockstep with the standards catalog. */
export const USD_SCOPE_STANDARD = "SINA policy — USD-only bands";

/** The informational violation a policy emits instead of silently skipping its bands. */
export function usdScopeFlag(currency: string): Violation {
  return {
    code: POLICY_BANDS_NOT_EVALUATED,
    message: `policy bands are defined in USD; this ${currency} payload passed format checks only — no amount band was evaluated`,
    standard: USD_SCOPE_STANDARD,
    severity: "flag",
  };
}
