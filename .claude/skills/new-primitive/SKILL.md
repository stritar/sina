---
name: new-primitive
description: Scaffold a headless, accessible core primitive (Radix base + theme tokens + a11y states + jest-axe test + playground story) from a design hand-off. Use when asked to "add a new primitive", "create a core component", or build a headless UI element like Dialog/Grid/CurrencyField.
---

> **Hardened in Phase 2** against the first Tier-1 build (VisuallyHidden, Icon, Dialog, Button, Field, CurrencyField, Select, Alert). The RSC rules below are not optional — they are what makes a primitive mountable server-side, which is the whole product.

Scaffold a new headless primitive in `@sina-design-system/core`. The boundary is hard: **no `zod`, no domain packages, no domain vocabulary** (no `$50,000`, NSN, CAC, "limit", "approval"). Primitives are styled only via `@sina-design-system/theme` tokens.

## Recipe

1. **Confirm design sign-off** (anatomy + interaction states). If the hand-off isn't signed off, stop and ask — that gate is binding (`CLAUDE.md`). Note: the Figma file (`l9OvywRftq3eaKzgEqzauJ`) currently has only `Cover` / `Foundations` pages — there is **no `Primitives` page** yet, so build to the theme tokens + the written anatomy in `.claude/PHASE_2_PRIMITIVES.md` until design lands.
2. **Create the component** `packages/core/src/<Name>/<Name>.tsx`:
   - Import Radix from the unified package as a namespace: `import { Dialog as Primitive } from "radix-ui"` → `Primitive.Root`, `Primitive.Content`, … (members: `Slot.Root`, `VisuallyHidden.Root`, `AccessibleIcon.Root`, `Label.Root`).
   - Relative imports use a **`.js` extension** and `import type` for types (`verbatimModuleSyntax`). The shared class merger is `import { cn } from "../utils/cn.js"`.
   - Style only via theme Tailwind tokens. Exact names (the preset OVERRIDES Tailwind defaults): `bg-surface` / `bg-surface-raised`, `text-text` / `text-text-muted` / `text-text-subtle`, `border-border` / `border-border-subtle`, `bg-primary` / `text-primary-fg`, status `bg-danger` / `text-danger-fg` / `bg-danger-bg`, focus `ring-focus-ring`, control dims `size-control-xs…xl`, `rounded-lg`, `shadow-lg` / `shadow-focus`, `z-overlay` / `z-modal` / `z-dropdown`, `duration-fast` / `ease-standard`. No hard-coded color.
   - Implement the a11y bar: focus-trap (Radix), correct ARIA, full keyboard operability, reduced-motion aware (`motion-reduce:animate-none`).
   - Add `"use client"` **only** if the file uses hooks/state/interactivity (Dialog, Select, Button, Field, CurrencyField). Pure presentational leaves (Alert, Icon, VisuallyHidden) stay server-compatible — omit it.
3. **RSC export rules (critical — primitives mount server-side):**
   - **Compound sets → individual named exports**, never one object. `export const Dialog = Primitive.Root; export const DialogContent = …`. A single object export from a `"use client"` module becomes one client reference, and `Dialog.Content` resolves to `undefined` across the server/client boundary (Next prerender: *"Element type is invalid … got undefined"*).
   - **No function/render-prop children** on a client component used from a Server Component (RSC: *"Functions cannot be passed directly to Client Components"*). Wrappers like `Field` take an **element child + `cloneElement`**; if the control sits inside an adornment wrapper, make that wrapper a small `forwardRef` component that forwards the injected `id`/`aria-describedby`/`aria-invalid` to the real `<input>`.
4. **Add the test** `packages/core/src/<Name>/<Name>.test.tsx`, modeled on `smoke.test.tsx`:
   - Render via `@testing-library/react`; `expect(await axe(container)).toHaveNoViolations()` (matcher + RTL `cleanup` are registered in `vitest.setup.ts`).
   - Add keyboard/focus assertions (`@testing-library/user-event`). Use plain DOM checks (`el.getAttribute(...)`, `el.value`) — **jest-dom matchers are not registered**.
   - Radix Select/listbox needs jsdom polyfills in the test: `scrollIntoView`, `hasPointerCapture`, `setPointerCapture`, `releasePointerCapture`, `ResizeObserver`.
5. **Re-export** the primitive (named) from `packages/core/src/index.ts`.
6. **Add a playground story** `apps/playground/app/primitives/<name>/page.tsx` using the shared `StoryShell` / `Demo` from `app/primitives/_components/`, linked from `app/primitives/page.tsx`. Render every state in isolation (no AI; that's Phase 4). A story that passes lucide glyphs needs `lucide-react` in the playground's deps.
7. **Verify:**
   - `pnpm --filter @sina-design-system/core lint typecheck test`
   - `pnpm --filter @sina-design-system/core build` (emits `dist`; confirms `"use client"` is preserved)
   - `pnpm --filter playground build` — **do not skip**; RSC export/render bugs only surface at prerender, not in unit tests.

## Reuses

- `packages/core/src/utils/cn.ts` (clsx + tailwind-merge).
- `packages/core/vitest.config.ts` (jsdom) + `vitest.setup.ts` (`toHaveNoViolations` + RTL `cleanup`).
- `packages/core/eslint.config.mjs` boundary rules (flag a `zod`/domain import).
- Stub banner style from `packages/core/src/index.ts`.
- Core deps available: `radix-ui`, `lucide-react`, `class-variance-authority`, `clsx`, `tailwind-merge`.

## Gotchas

- `pnpm install` after adding a dep: `CI=true pnpm install --no-frozen-lockfile` (the bare command aborts on the no-TTY modules-purge guard / frozen lockfile).
- Tailwind text/border colors double up by design: muted body text is `text-text-muted`, default border is `border-border` (color key is `text` / `border`).
