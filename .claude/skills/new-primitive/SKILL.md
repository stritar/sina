---
name: new-primitive
description: Scaffold a headless, accessible core primitive (Radix base + theme tokens + a11y states + jest-axe test + playground story) from a design hand-off. Use when asked to "add a new primitive", "create a core component", or build a headless UI element like Dialog/Grid/CurrencyField.
---

> **Hardened in Phase 2** against the first Tier-1 build (VisuallyHidden, Icon, Dialog, Button, Field, CurrencyField, Select, Alert). The RSC rules below are not optional — they are what makes a primitive mountable server-side, which is the whole product.

Scaffold a new headless primitive in `@sina-design-system/core`. The boundary is hard: **no `zod`, no domain packages, no domain vocabulary** (no `$50,000`, NSN, CAC, "limit", "approval"). Primitives are styled only via co-located CSS Modules consuming `@sina-design-system/theme` `--sina-*` tokens (Tailwind is gone).

## Recipe

1. **Confirm design sign-off** (anatomy + interaction states). If the hand-off isn't signed off, stop and ask — that gate is binding (`CLAUDE.md`). The SINA Figma file is `kRTCdsBg4WpiGxQQGfvoLU` (see [[sina-figma-file]]) — build to the theme tokens + the written anatomy, and mirror the new primitive into Figma via `/primitive-figma-sync`.
2. **Create the component** `packages/core/src/<Name>/<Name>.tsx`:
   - Import Radix from the unified package as a namespace: `import { Dialog as Primitive } from "radix-ui"` → `Primitive.Root`, `Primitive.Content`, … (members: `Slot.Root`, `VisuallyHidden.Root`, `AccessibleIcon.Root`, `Label.Root`).
   - Relative imports use a **`.js` extension** and `import type` for types (`verbatimModuleSyntax`). The shared class merger is `import { cn } from "../utils/cn.js"`.
   - **Style via a co-located `packages/core/src/<Name>/<Name>.module.css`** (Tailwind is gone). Author flat class names (`.root`, `.primary`, `.sm`, `.iconLeft`) — no BEM, no CSS nesting — with real pseudo-classes for state (`.root:focus-visible`, `.primary:hover:not(:disabled)`) and Radix data-attributes (`.content[data-state="open"]`). In the `.tsx`: `import styles from "./<Name>.module.css"` and compose via `cn(styles.root, styles[variant], className)`. Declare a **per-component `--sina-<name>-*` token layer** aliasing the semantic `--sina-*` tokens (from `packages/theme/theme.css`) in a `:root` block and consume those (`--sina-<name>-bg: var(--sina-color-primary)`). **Never write a raw color** (`#hex`/`rgb()`) except a codemod-injected `var()` fallback — run `node scripts/codemod-tokens.mjs` to inject the resolved `#hex`/length fallbacks. See **`packages/core/CSS_TOKENS.md`** (utility→token cheat-sheet + per-component recipe) and the `Button` / `Dialog` references (`packages/core/src/{Button,Dialog}/`).
   - Implement the a11y bar: focus-trap (Radix), correct ARIA, full keyboard operability, reduced-motion aware (handled at the token layer — `--sina-duration--*` is already `0ms` under `prefers-reduced-motion`, so no per-rule guard needed).
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
   - `node scripts/codemod-tokens.mjs` (inject/refresh the `var()` fallbacks) then `node scripts/verify-tokens.mjs` (no raw colors; every managed `var(--sina-*)` has a fallback — also enforced by `src/offgrid-utilities.test.ts`).
   - `pnpm --filter @sina-design-system/core lint typecheck test`
   - `pnpm --filter @sina-design-system/core build` (Vite library mode + `tsc --emitDeclarationOnly`; emits `dist/*.js` + `dist/styles.css` and preserves `"use client"` on client modules)
   - `pnpm --filter playground build` — **do not skip**; RSC export/render bugs only surface at prerender, not in unit tests.

## Reuses

- `packages/core/src/utils/cn.ts` (clsx). Tests run vitest with `css.modules.classNameStrategy: "non-scoped"`, so `styles.root === "root"`.
- `packages/core/vitest.config.ts` (jsdom) + `vitest.setup.ts` (`toHaveNoViolations` + RTL `cleanup`).
- `packages/core/eslint.config.mjs` boundary rules (flag a `zod`/domain import).
- Stub banner style from `packages/core/src/index.ts`.
- Core deps available: `radix-ui`, `lucide-react`, `clsx`.

## Gotchas

- `pnpm install` after adding a dep: `CI=true pnpm install --no-frozen-lockfile` (the bare command aborts on the no-TTY modules-purge guard / frozen lockfile).
- **No raw colors in `*.module.css`** — author every color as `var(--sina-color-*)` and let `node scripts/codemod-tokens.mjs` inject the `#hex` fallback; `node scripts/verify-tokens.mjs` fails the build on a raw color or a managed `var()` missing its fallback.
- **Spacing/sizing come from tokens too** — use `var(--sina-space--*)` (half-steps are `--sina-space--0_5` / `--sina-space--1_5`) and `var(--sina-size--icon-*)` rather than raw lengths; consult the `CSS_TOKENS.md` utility→token map for the exact token name.
