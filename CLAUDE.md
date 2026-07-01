# SINA — Working Rules for Claude

SINA is a governed design system for AI agents: an LLM emits *intent*, SINA validates it against Zod schemas (the "Constitution") **server-side**, and either blocks the stream or mounts an accessible, governed React primitive. The principle is **validate-then-mount** — never mount, then check. It's free and made for startups and individuals who want a design system with governance built in, so they can adopt agentic UI generation without building the governance layer themselves.

This file is **binding**. `ROADMAP.md` explains the *why* and the phase sequencing; this file is the *rules*.

## Current phase

For what is done and what is next, read **`.claude/PHASE_STATE.md`** — do **not** re-audit the whole repo to figure out the phase. Update it only via the `/phase-status` skill.

## Architectural boundaries (hard rules)

These mirror the per-package ESLint `no-restricted-imports` messages, so the agent and the linter say the same thing. A hand-off that would violate one of these must be pushed back on, with a proposal for where the concern belongs.

- **`@sina-design-system/theme`** — design tokens + Tailwind preset only. **No React, no react-dom.**
- **`@sina-design-system/core`** — headless, accessible primitives on Radix, styled via `theme`. **No `zod`, no domain packages (`fintech`/`defense`), and no domain *vocabulary*** (no `$50,000`, NSN, CAC, "limit", "approval"). Strictly domain-agnostic.
- **`@sina-design-system/fintech`** (and future `defense`) — pure Zod constitution. **No React, no `core`, no `theme`, no UI of any kind.**

**The one invariant (ROADMAP §1b):** the model emits **intent + props, never a component**. Validation runs **server-side only**; client-side checks are untrusted UX sugar. We **validate, then mount** — RSC tokens already streamed cannot be un-rendered, so the schema gate sits *before* any `core` primitive mounts.

## Conventions

- **Naming:** libraries are scoped `@sina-design-system/*`; apps are bare (`web`, `playground`).
- **Layout:** `src/index.ts` is the public surface (named exports only — no default exports for library code); tests co-located as `src/**/*.test.ts(x)`; ESM (`"type": "module"`), `sideEffects: false`, built via `tsc` → `dist/`, `exports` map points at `dist`.
- **Stub/banner style:** every `src/index.ts` opens with a block comment naming the package and its boundary; match the existing stubs when adding files.
- **Colors are authored in hex only** (`#rrggbb`, or `#rrggbbaa` for baked-in alpha) in `packages/theme/theme.css` — never RGB channels, `rgb()/hsl()/oklch()`, or named colors. Opacity comes from the Tailwind preset's `color-mix()` wrapper (so `bg-primary/50` works) or an explicit `color-mix(...)` for one-off translucency (see the shadow tokens). A vitest guard in `packages/theme/src/tokens.test.ts` fails the build on any non-hex color token.
- **The a11y bar** — every `core` primitive must meet **all four**: focus-trap + correct ARIA + full keyboard operability + **automated `axe` (jest-axe) pass**. Tests reuse core's `vitest.config.ts` (jsdom) and `vitest.setup.ts` (`toHaveNoViolations` already registered).

## Contracts

- **Interception contract** — every schema returns this exact surface:
  `{ valid: boolean, violations: Violation[], requiredComponent: string | null }`
  - pass → `{ valid: true, violations: [], requiredComponent: null }`
  - fail → `{ valid: false, violations: [...], requiredComponent: "SecureWireDialog" }`
- **Audit event** — every interception emits:
  `{ timestamp, payload, result, violations, decidedComponent }`
  Contract now; the real sink is wired in Phase 8.

## Commands

- Whole workspace (delegate to Turbo): `pnpm build | dev | lint | typecheck | test`.
- Single package: `pnpm --filter <name> <script>` (e.g. `pnpm --filter @sina-design-system/core test`).
- Playground dev on **3001** (`pnpm --filter playground dev`); web on **3000**.
- Note: the `lint`/`typecheck` Turbo tasks `dependsOn: ["^build"]`, so a filtered dependent needs upstream `dist` to exist.
- **Apps consume built `dist/`, never `src`.** `apps/*` resolve `@sina-design-system/*` through each package's `exports`/`main` map (→ `dist/`); Next `transpilePackages` only transpiles, it does **not** redirect resolution to source. So an edit to a library's `src` is invisible to a running playground/web until that package's `dist` is rebuilt. For iterative cross-package work run **`pnpm dev` from the repo root** (Turbo runs each library's `tsc --watch` alongside the app); `pnpm --filter playground dev` alone watches *only* the app and will serve stale library output. For a one-off check, `pnpm --filter <pkg> build` the edited library before verifying. Symptom of forgetting: stale UI (old icon/style) that makes a correct edit look broken — see `/preview-change`.

## Process gate

- **Design sign-off gates implementation.** Do not fill a package's content until its design hand-off is signed off — the stubs say "pending design sign-off" and that is binding.
- See `ROADMAP.md` §1a (agentic setup) and §1b (the invariant) for full rationale.

## Skills (repeatable recipes)

Invoke with `/<name>`. Each is a best-guess seed, hardened on first real use.

- `/new-primitive` — scaffold a headless `core` primitive (Radix + theme tokens + a11y + axe test + playground story).
- `/new-schema` — scaffold a Zod governance schema in `fintech`/`defense` with the interception contract + valid/adversarial fixtures.
- `/new-web-section` — add a marketing/docs section to `apps/web` consuming `theme`.
- `/adversarial-test` — generate a hostile-stream test case against a chosen schema.
- `/phase-status` — read/update `.claude/PHASE_STATE.md`; the source of truth for phase progress.
- `/figma-component-coverage` — when adding/updating a component in Figma, enforce that **all** its props are displayed: full variant matrix + a coverage frame demonstrating every boolean/instance-swap/text prop.
- `/primitive-figma-sync` — keep a `core` primitive and its SINA Figma component in lockstep both ways: mirror a `packages/core/**` prop/variant/token change into Figma, or a Figma component change back into code. Pairs with `/figma-component-coverage` as the acceptance test.
- `/preview-change` — before visually verifying a `packages/*` edit in the playground/web, refresh the consumed `dist/` (root `pnpm dev` watch, or `pnpm --filter <pkg> build`) so apps never render stale library output.
