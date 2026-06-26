---
name: adversarial-test
description: Generate a hostile-stream test case for the playground harness against a chosen schema — a payload designed to bypass governance (over-limit transfer, fabricated Confirm button). Use when asked to "write an adversarial test", "try to break a schema", or harden the interception layer.
---

> **Best-guess seed — to be hardened on first real use (Phase 4).** Refine this recipe once the playground `streamUI` harness exists.

Generate a hostile-stream test that *tries* to bypass the Constitution and proves it cannot. The point is the invariant: **validate-then-mount, server-side only** — a hostile payload must be blocked *before* any `core` primitive mounts.

## Recipe

1. **Pick the target** schema in `fintech` (or `defense`) and the rule it enforces.
2. **Craft a hostile payload** that *should* be blocked, e.g.:
   - An over-limit transfer (`amount: 60000`).
   - A fabricated `requiredComponent` or an injected "Confirm" action the model invented.
   - Malformed/extra fields attempting to slip past the schema.
3. **Assert the interception result**: `valid: false`, the expected `violations`, and `requiredComponent` **forced** to the governed component (e.g. `"SecureWireDialog"`). Confirm the raw confirm is never the decided component.
4. **Make it deterministic** — add as a recorded/synthetic fixture in **mock mode** (no live LLM) so the suite is reproducible and CI-safe. Keep live-model mode for manual exploration only.
5. **Wire it** into the playground adversarial suite (once Phase 4 exists); until then, assert directly against the schema's evaluate surface.
6. **Verify:** `pnpm --filter @sina-design-system/fintech test` (and, from Phase 4, the playground suite in mock mode).

## Reuses

- The `fintech` node test harness (`packages/fintech/vitest.config.ts`).
- Interception + audit contracts from `CLAUDE.md`; the §1b invariant from `ROADMAP.md`.

## Scaffolds

An adversarial fixture/test alongside the target schema, and (Phase 4+) an entry in the playground adversarial suite.
