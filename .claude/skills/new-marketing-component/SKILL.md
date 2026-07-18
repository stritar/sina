---
name: new-marketing-component
description: Scaffold a new SINA marketing (Broadsheet) component end to end in apps/web — component + CSS module on --sinamk-* tokens, the data-broadsheet focus marker, a registry entry that drives the /showcase overview and the auto-axe gate, then a Figma sync. Use when asked to "add a marketing component", "new Broadsheet component", "add a marketing button/badge/etc", or to build an isolated marketing UI element (never a packages/* primitive).
---

> Broadsheet is the SINA **marketing** component library, living entirely in `apps/web/app/(marketing)/broadsheet/`, **isolated from `packages/*` and the core primitives** (zero `@sina-design-system/*` imports). Components consume the `--sinamk-*` foundation, carry the `data-broadsheet` focus marker, and register in one manifest that powers the `/showcase` overview page and the automatic a11y + focus guards. Adding a component should cost one component file, one CSS module, and one registry entry. The reference implementation is `ButtonSecondary.tsx` / `.module.css` — copy its shape.

## When this fires

- "Add a marketing component / Broadsheet component / marketing `<X>`."
- A Figma marketing component needs a code counterpart under the marketing site.
- NOT for `packages/*` primitives — those use `/new-primitive`. Broadsheet never imports core.

## Recipe

1. **Create the component** `broadsheet/<Name>.tsx`. Native element root (`<button>`, `<a>`, `<div role=…>`); put `data-broadsheet=""` on the focusable root (earns the global blue outline — `/marketing-focus-outline`). Type props off the DOM element (`Omit<ButtonHTMLAttributes<…>, …>`), add a `size?: "sm" | "md" | "lg"` mapped to a `data-size` attribute, and any variant/state props. For a loading state reuse `./Spinner`. Icons come from the **caller** via `@phosphor-icons/react/dist/ssr` (a prop), never bundled in. Join classes with the local `./cn`.
2. **Style it** `broadsheet/<Name>.module.css`. Consume only `--sinamk-*` tokens via `var(--sinamk-*, <fallback>)` (the size scale is already in `broadsheet.css`); author **no** raw values and **no** `:focus-visible` (`/broadsheet-foundations`, `/marketing-focus-outline`). If a token is missing, run the foundations process gate (ask before minting one). Mirror the `data-size` / `data-force-state` / `:hover` / `:active` / `:disabled` / `[data-loading]` pattern from `ButtonSecondary.module.css`.
3. **Register it** in `broadsheet/registry.tsx`: append a `ComponentSpec` with an `id`, `name`, a `controls` schema (each prop as a `select` / `boolean` / `text` control with a default), and a `render(values)` that maps control values to props. This is what makes it show up in `/showcase` with all props and what the guards iterate.
4. **Export it** from `broadsheet/index.ts` (component + prop types).
5. **Preview** at `/showcase` (`pnpm dev` from repo root, then open `http://localhost:3000/showcase`): the new component appears in the picker with an auto-generated control sidebar. Toggle every variant/state; confirm the soft hover transition and the blue keyboard-focus ring.
6. **Mirror into Figma** under the SINA-marketing file's ▸ Components page via `/figma-component-coverage` (full variant matrix + a coverage frame for every prop). Keep the code and Figma variant axes in lockstep.

## Guards (all registry-driven, run under web's vitest)

```
pnpm --filter web exec vitest run broadsheet
```
- `registry-a11y.test.tsx` — jest-axe across every variant of every registered component (auto-covers the new one).
- `marketing-focus.test.tsx` — the new component's root carries `data-broadsheet`; no module authors `:focus-visible`.
- `foundations.test.ts` — the new module uses `--sinamk-*` tokens only, no raw color, no fallback-less var.

Also run `pnpm --filter web typecheck lint` and confirm `/showcase` still emits statically (`pnpm --filter web pages:build`) — a marketing route must stay Cloudflare-static-safe (`/cf-pages-safe`): client component, no Route Handler, no `node:*`.

## Reuses

- `broadsheet/ButtonSecondary.tsx` + `.module.css` — the component template (sizes, states, forceState, loading, marker).
- `broadsheet/IconButton.tsx` — icon-only variant with a required `label` for the accessible name.
- `broadsheet/broadsheet.css` — the `--sinamk-*` foundation + the one focus rule.
- `broadsheet/types.ts` + `registry.tsx` — the controls-schema contract and manifest.
- `showcase/Sandbox.tsx` — the generic registry-driven sandbox (do not edit per component; it reads the registry).

## Gotchas

- **No `@sina-design-system/*` imports.** Broadsheet is standalone marketing; pulling a core primitive breaks the isolation this library exists for.
- **A page that renders Broadsheet components must import `broadsheet.css`** and sit under a `.broadsheet` marker (see `showcase/page.tsx`) so the `--sinamk-*` tokens and dark variant are in scope.
- **Do not register the demo module in `mdx-components.tsx` or add a docs page** — that is the `/docs` primitive flow. Broadsheet's home is `/showcase`, driven by the registry.
- English-only route; the i18n catch-all does not cover `/showcase`, which is fine for a component gallery.
