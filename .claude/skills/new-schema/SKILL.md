---
name: new-schema
description: Scaffold a Zod governance schema in fintech (or defense) implementing the interception contract, plus valid + adversarial fixtures. Use when asked to "add a schema", "encode a governance rule", or define a constitution rule (limits, approvals, classification).
---

> **Hardened in Phase 3** against the real pattern. The flagship `wire-transfer`
> schema is the canonical worked example — copy its shape.

Scaffold a new Zod governance schema in `@sina-design-system/fintech` (or the future `defense`).
The boundary is hard: **pure Zod, no React, no `core`, no `theme`, no UI**. The shared contract +
engine live in `@sina-design-system/governance`; domains depend on it, never the reverse.

## Golden rule

**Never invent a limit or format.** Every numeric threshold, format, and required-field rule must
trace to a standard or regulator, with the **citation in the code** (a `// 31 CFR …` comment on the
constant, and `standard: "…"` on the `Violation`). If you can't cite it, don't encode it — ask.

## Architecture (what goes where)

- **`packages/governance`** — `intercept()`, the `{ valid, violations, requiredComponent }` contract,
  `Severity`, `AuditEvent`, `setAuditSink`/`emitAudit`, and `redact()`. Domain-agnostic; don't add
  domain vocabulary here.
- **`packages/fintech/src/formats/*`** — reusable, cited format primitives (`currency`, `amount`,
  `iban`, `bic`, `routing`, `card`). Each exports a Zod schema **and** a raw `isValid…` fn so the
  checksum is unit-testable directly. Reuse these — don't re-derive a checksum.
- **`packages/fintech/src/thresholds.ts`** — the single, cited source of truth for every numeric
  limit (USD integer minor units via `usd()`).

## Recipe

1. **Confirm design sign-off** for the governance *rule*. If not signed off, stop and ask.
2. **Reuse `formats/` + `thresholds.ts`.** Add a new cited constant to `thresholds.ts` if the rule
   needs a new limit; add a new `formats/<x>.ts` primitive only if a format isn't covered yet.
3. **Create `packages/fintech/src/<rule>/<rule>.schema.ts`:**
   - A **closed** payload: `z.object({ … }).strict()` — `.strict()` is the defense against fabricated
     keys (a hallucinated "Confirm" button, smuggled card data). Make nested objects `.strict()` too.
   - Multi-leg shapes (e.g. SEPA vs ACH account): `z.discriminatedUnion("<key>", […])` for precise errors.
   - Amounts are **integer minor units** (`minorUnitAmount` + bounds from `thresholds`); never floats.
   - A `policy(data) => Violation[]` for post-parse limit/classification rules. Pick severity per rule:
     - `reject` → hard block (malformed/illegal payload), `requiredComponent` stays null.
     - `escalate` → force a governed component (maps via the `escalations` table).
     - `flag` → audit-only, **does not block** (use for reporting duties like CTR/SAR, not UI gates).
   - Export `evaluate<Rule>(payload) = intercept({ schema, policy, escalations, redaction, version }, payload)`.
   - `redaction` must `drop` prohibited data (`PROHIBITED_CARD_FIELDS`) and `hash` raw account
     identifiers (`iban`, `accountNumber`) so the audit trail never stores what the rule forbids.
4. **Add fixtures** `packages/fintech/src/<rule>/fixtures.ts`: valid ones typed as the payload (drift
   breaks them at compile time); adversarial ones typed `unknown` (they model hostile streams).
5. **Add the test** `packages/fintech/src/<rule>/<rule>.test.ts` (node env), modeled on
   `wire-transfer.test.ts`:
   - **Valid** — a compliant payload → `valid: true`; assert flag-only violations don't block.
   - **Adversarial** — over-limit → forced `requiredComponent`; malformed format → `reject`; smuggled
     key → `.strict()` reject. Assert the full `{ valid, violations(code+standard), requiredComponent }`
     and that an audit event fired (inject a `vi.fn()` sink via `setAuditSink`, `resetAuditSink` in teardown).
6. **Re-export** from `packages/fintech/src/index.ts`.
7. **Verify:** `CI=true pnpm --filter @sina-design-system/fintech build lint typecheck test`.

## Reuses

- `@sina-design-system/governance` — `intercept`, contract types, `setAuditSink`/`resetAuditSink`, `RedactionConfig`.
- `packages/fintech/src/formats/*` + `thresholds.ts` (cited primitives + limits).
- `packages/fintech/vitest.config.ts` (node env) and `eslint.config.mjs` boundary rules.

## Gotchas

- **Run pnpm with `CI=true`** in this environment, else the no-TTY modules-purge aborts (see
  [[pnpm-verify-deps-purge]]). A filtered `lint`/`typecheck` needs upstream `dist` (`dependsOn: ["^build"]`),
  so `build` governance/fintech first.
- **`noUncheckedIndexedAccess` is on** — capture indexed lookups in a const before returning them.
- **Cross-field rules go in `policy()`** (object-level), not Zod `.refine(ctx.parent…)` (that idiom
  doesn't exist in Zod 3) — or use `.superRefine` on the object if it must fail the parse.

## Scaffolds

`fintech/src/<rule>/<rule>.schema.ts`, `fintech/src/<rule>/fixtures.ts`,
`fintech/src/<rule>/<rule>.test.ts`, plus new cited entries in `thresholds.ts` / `formats/` as needed,
and the `index.ts` re-export.
