---
name: new-governed-component
description: Scaffold a governed fintech component in @sina-design-system/fintech-react — a core primitive composed with a fintech schema, rendered as the component the constitution FORCES on escalation. Use when asked to "add a governed component", "compose a primitive + schema", or build a SecureWireDialog-style flow.
---

> **Seeded in Phase 5** by `SecureWireDialog` — the canonical worked example. Copy its shape:
> `packages/fintech-react/src/SecureWireDialog/`.

A governed component is the third layer: it **marries a `core` primitive to a `fintech` schema** and
renders the decision the constitution already made. It lives in `@sina-design-system/fintech-react`
— the one package allowed to import both `core` and `fintech`.

## Golden rule

**The component never validates. The gate is server-side (§1b).** A governed component collects
intent/evidence and calls a **server action** that re-runs the constitution; it renders the verdict.
Corollary for approval-style flows: **never compute a binding hash client-side and send it** — the
server recomputes the hash over the submitted terms, so the client's copy is never trusted. A denied
re-gate must keep the block in place (the un-bypassable moment), never flip to success locally.

## Architecture (what goes where)

- **`packages/core`** — the headless, domain-agnostic primitives you compose (`Dialog`, `Button`,
  `SummaryList`, `Alert`, `Badge`, `CredentialOTP`, `Stack`, `TextField`). No domain words here.
- **`packages/fintech`** — the schema + policy + fixtures the component is governed by. If the
  component needs a new rule (e.g. an approval envelope), extend the schema **there** first via
  `/new-schema`; author no `zod` in `fintech-react`.
- **`packages/fintech-react`** — the governed component. May import `core` + `fintech` + `theme` +
  `governance`; must NOT import `zod` or `defense` (its `eslint.config.mjs` enforces this).
- **`apps/playground`** — the server action (`"use server"`) that re-gates, the `requiredComponent`
  registry (`_lib/registry.tsx`), the host that bridges a `GateTrace` to the component, and the story.

## Recipe

1. **Confirm design sign-off** for the component anatomy + states. If not signed off, stop and ask.
2. **Schema first.** If the governance rule isn't modeled yet, extend `fintech` via `/new-schema`
   (new violation codes, `escalations` → your component name, fixtures). Model server-supplied
   context (e.g. an initiator identity) as a **function argument, not a payload field**, so a hostile
   stream can't satisfy its own check.
3. **Create `packages/fintech-react/src/<Name>/<Name>.tsx`** (`"use client"`):
   - Compose `core` primitives into the signed-off states (a small phase machine in one `DialogContent`).
   - Props: the escalated `intent`, the `violations` (for citations), and an `onSubmit…` callback that
     returns the server re-gate's decision. Never take a raw payload and validate it here.
   - Read the intent defensively (tolerate a hostile shape). Prefer `core`'s on-system `Stack gap`/`Grid`
     for layout so spacing stays on the token scale.
   - **Style via a co-located `<Name>.module.css`** (Tailwind is gone) — `import styles from "./<Name>.module.css"`
     and pass merged classes into `core` primitives via `clsx(styles.x, className)`, not Tailwind class strings.
     Declare a per-component `--sina-<name>-*` token layer aliasing the semantic `--sina-*` tokens; **no raw
     colors**; run `node scripts/codemod-tokens.mjs` (inject fallbacks) + `node scripts/verify-tokens.mjs`.
     See `packages/core/CSS_TOKENS.md`. `fintech-react`'s build emits its own `dist/styles.css` (imported in
     the app layout), so component CSS ships automatically.
4. **a11y test** `<Name>.test.tsx` (jsdom + jest-axe; copy the `matchMedia`/`ResizeObserver` shims):
   `expect(await axe(document.body)).toHaveNoViolations()` on the open component, plus behavior tests
   for the approve → governed and deny → still-blocked paths. Assert the component never sends a hash.
5. **Re-export** from `packages/fintech-react/src/index.ts` (named exports only).
6. **Wire the harness (`apps/playground`):** a `"use server"` re-gate action (compute any binding hash
   **here**); register the name in `_lib/registry.tsx`; a `<Name>Host` that bridges `trace` → component
   and lifts an approved `ConsoleView` up to `EmulatorShell`; new `scenarios.ts` entries; new
   `gate.test.ts` assertions (approved passes, each bypass rejects); a `primitives/<slug>/page.tsx` story
   calling the real server action.
7. **Verify** (see below), then keep code ↔ Figma in lockstep via `/primitive-figma-sync` +
   `/figma-component-coverage`.

## Reuses

- `packages/fintech-react/src/SecureWireDialog/*` — the worked example (component, test, format util).
- `core` primitives + `packages/fintech-react/vitest.config.ts` / `vitest.setup.ts` (jsdom + jest-axe).
- The emulator seam: `_lib/gate.ts` (`runGate`), `_lib/regate.ts`, `_lib/registry.tsx`, `_lib/types.ts`
  (`GovernedComponentProps`).

## Gotchas

- **Run pnpm with `CI=true`** (no-TTY purge — see [[pnpm-verify-deps-purge]]) and **sandbox-off** for
  vitest (`/tmp` EPERM). A new package needs `pnpm install --no-frozen-lockfile`.
- **Apps consume `dist/`, not `src`** — rebuild `fintech`/`fintech-react` (`pnpm --filter <pkg> build`,
  or root `pnpm dev`) before verifying in the playground, else it serves stale output (see `/preview-change`).
- **Keep the re-gate action free of the AI SDK** (its own file) so the a11y test doesn't pull `ai` into jsdom.
- **No raw colors in `*.module.css`** — author colors as `var(--sina-color-*)` and let
  `node scripts/codemod-tokens.mjs` inject the `#hex` fallback; `node scripts/verify-tokens.mjs` fails on a
  raw color or a missing fallback. Keep spacing on the `var(--sina-space--*)` scale via `core`'s `gap`/`size`.

## Scaffolds

`packages/fintech-react/src/<Name>/<Name>.tsx` + `<Name>.test.tsx`, the `index.ts` re-export; in
`apps/playground`: `_lib/regate.ts` (or equivalent server action), `_lib/registry.tsx` entry,
`_components/<Name>Host.tsx`, `scenarios.ts` + `gate.test.ts` additions, `primitives/<slug>/page.tsx`.
