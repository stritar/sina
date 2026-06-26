---
name: new-schema
description: Scaffold a Zod governance schema in fintech (or defense) implementing the interception contract, plus valid + adversarial fixtures. Use when asked to "add a schema", "encode a governance rule", or define a constitution rule (limits, approvals, classification).
---

> **Best-guess seed — to be hardened on first real use (Phase 3).** Refine this recipe the first time you encode a real governance rule.

Scaffold a new Zod governance schema in `@sina-design-system/fintech` (or the future `defense`). The boundary is hard: **pure Zod, no React, no `core`, no `theme`, no UI**.

## Recipe

1. **Confirm design sign-off** for the governance *rule* (the limit / allowed action / classification logic). If not signed off, stop and ask (gate from `CLAUDE.md`).
2. **Create the schema** `packages/fintech/src/<rule>.schema.ts`:
   - Pure Zod; encodes the rule (e.g. standard transfer `amount <= 50000`).
   - Expose an **evaluate** surface returning the **interception contract** exactly:
     `{ valid, violations, requiredComponent }` — pass → `{ true, [], null }`; fail → `{ false, [...], "SecureWireDialog" }`.
   - Map each failure mode to the `requiredComponent` the design specifies (e.g. limit breach → `"SecureWireDialog"`).
3. **Emit the audit event** at the decision point: `{ timestamp, payload, result, violations, decidedComponent }`. Contract-level only — the real sink lands in Phase 8.
4. **Add the test** `packages/fintech/src/<rule>.test.ts` (node env), modeled on `packages/fintech/src/smoke.test.ts`:
   - **Valid fixture** — a compliant payload (e.g. `$5,000`) → `valid: true`.
   - **Adversarial fixture** — a hostile payload (e.g. `$60,000`) → `valid: false`, expected `violations`, forced `requiredComponent`.
5. **Re-export** from `packages/fintech/src/index.ts`.
6. **Verify:** `pnpm --filter @sina-design-system/fintech lint typecheck test`.

## Reuses

- `packages/fintech/vitest.config.ts` (node env).
- `packages/fintech/eslint.config.mjs` boundary rules (they will flag a React/`core`/`theme` import).
- Interception + audit contract shapes from `CLAUDE.md`.

## Scaffolds

`fintech/src/<rule>.schema.ts`, `fintech/src/<rule>.test.ts`, and the `index.ts` re-export.
