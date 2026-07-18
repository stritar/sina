---
name: broadsheet-foundations
description: Keep marketing (Broadsheet) component CSS on --sinamk-* foundation tokens, never raw values; add a token (with sign-off) when a style is missing rather than hard-coding it. Use when styling a component under apps/web/app/(marketing)/broadsheet/, when asked to "use a token not a raw value", "match this to a foundation", "add a marketing token", or when the foundations guard test fails.
---

> **The invariant:** a Broadsheet component `*.module.css` never authors a raw value for a themed property. Every color/length/radius/duration resolves to a `--sinamk-*` foundation via `var(--sinamk-*, <fallback>)` (or `color-mix()` over one). Raw values live in **exactly one file**, `apps/web/app/(marketing)/broadsheet/broadsheet.css` (the token layer, the marketing analog of `theme.css`). This is the "Broadsheet components consume foundations, never raw values" rule in `CLAUDE.md`, and the marketing twin of the product rule "component `*.module.css` never write a raw color, only `var(--sina-*)`".

## The process gate (important)

If a component needs a value with **no matching `--sinamk-*` token**, do **not** hard-code it. A new token is a foundation change:

1. **Stop and ask** the user (or designer) for permission to introduce the token, naming it and its value. Treat this like design sign-off.
2. Once approved, add it to `broadsheet.css` (light value, plus a `[data-theme="dark"] .broadsheet` value if it is a color), following `TOKEN_NAMING` grammar adapted to the `--sinamk-` prefix (`--sinamk-color-*`, `--sinamk-space--*`, a `--` before a state/variant/scale-step modifier).
3. Consume it in the component as `var(--sinamk-<name>, <fallback>)` with a hand-authored fallback.

Never invent a token silently to dodge the guard, and never paste a raw hex into a component module.

## Recipe (styling a component)

1. For each value the design needs, find the matching `--sinamk-*` token in `broadsheet.css` (colors, the `--sinamk-control-*`/`--sinamk-text--*`/`--sinamk-icon--*` size scale, `--sinamk-radius--*`, `--sinamk-duration--*`).
2. Reference it as `var(--sinamk-*, <fallback>)`. **Every** `var(--sinamk-*)` carries a fallback (the guard fails a fallback-less one) so the component still renders outside a `.broadsheet` scope.
3. For a private per-component alias, define `--_name: var(--sinamk-*, <fallback>)` on the root and consume `var(--_name)` (private `--_*` vars need no fallback).
4. If a token is missing, run the process gate above.
5. Raw color literals are allowed **only** inside a `var()` fallback. No `rgb()/hsl()/oklch()`, no bare hex, no named colors elsewhere in the module.

## Verify

```
pnpm --filter web exec vitest run foundations   # no raw color, no fallback-less var(--sinamk-*)
```

## Gotchas

- **`broadsheet.css` is the only raw-value file.** The guard scans `broadsheet/*.module.css`, not the token file, so authoring hex there is correct.
- **Fallbacks are required, not optional.** `var(--sinamk-color-text)` fails; `var(--sinamk-color-text, #353b31)` passes.
- **Keep fallbacks simple** (a hex or a length or a keyword like `ease`) so they contain no nested parens — the guard blanks `var(...)` calls to find stray raw colors.
- Pairs with `/marketing-focus-outline` and `/new-marketing-component`.
