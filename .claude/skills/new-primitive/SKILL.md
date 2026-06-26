---
name: new-primitive
description: Scaffold a headless, accessible core primitive (Radix base + theme tokens + a11y states + jest-axe test + playground story) from a design hand-off. Use when asked to "add a new primitive", "create a core component", or build a headless UI element like Dialog/Grid/CurrencyField.
---

> **Best-guess seed — to be hardened on first real use (Phase 2).** Refine this recipe the first time you build a real primitive.

Scaffold a new headless primitive in `@sina-design-system/core`. The boundary is hard: **no `zod`, no domain packages, no domain vocabulary** (no `$50,000`, NSN, CAC, "limit", "approval"). Primitives are styled only via `@sina-design-system/theme` tokens.

## Recipe

1. **Confirm design sign-off** for this primitive (anatomy + interaction states). If the hand-off isn't signed off, stop and ask — the stubs say "pending design sign-off" and that gate is binding (see `CLAUDE.md`).
2. **Create the component** `packages/core/src/<Name>/<Name>.tsx`:
   - Headless React built on `radix-ui@^1.1.2`.
   - Styled only via `theme` tokens (Tailwind classes from the preset / CSS variables). No hard-coded colors.
   - Implement the **a11y bar**: focus-trap, correct ARIA roles/attributes, full keyboard operability.
   - Named export only; open the file with a short banner comment matching the existing stub style.
3. **Add the test** `packages/core/src/<Name>/<Name>.test.tsx`, modeled on `packages/core/src/smoke.test.tsx`:
   - Render via `@testing-library/react`.
   - Assert `await axe(container)` then `expect(results).toHaveNoViolations()` (matcher is already registered in `packages/core/vitest.setup.ts`).
   - Add keyboard/focus assertions for the interaction states.
4. **Re-export** the primitive (named) from `packages/core/src/index.ts`.
5. **Add a playground story** — render the primitive in isolation under `apps/playground/app` for visual/a11y sanity (no AI yet; that's Phase 4).
6. **Verify:** `pnpm --filter @sina-design-system/core lint typecheck test`.

## Reuses

- `packages/core/vitest.config.ts` (jsdom) + `packages/core/vitest.setup.ts` (`toHaveNoViolations`).
- `packages/core/eslint.config.mjs` boundary rules (they will flag a `zod`/domain import).
- Stub banner style from `packages/core/src/index.ts`.

## Scaffolds

`core/src/<Name>/<Name>.tsx`, `core/src/<Name>/<Name>.test.tsx`, the `index.ts` re-export, and a playground story.
