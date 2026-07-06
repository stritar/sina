---
name: error-warning-icon
description: Add (or audit) the mandatory bold error/warning glyph on any component that surfaces an error, warning, danger, critical, or invalid state. Use when asked to "add the error icon", "warning state needs an icon", "audit error/warning states", when building/editing any component with a danger/warning intent, or when the error-warning-icon guard test fails.
---

> **The invariant:** meaning is never carried by color + text alone. Any `core` or `fintech-react` component that surfaces an **error** or **warning** state must render the matching **bold** Phosphor glyph beside the text — `Warning` (`weight="bold"`) for warning, `WarningOctagon` (`weight="bold"`) for error/danger. The companion status glyphs are `Info` and `CheckCircle` (`weight="bold"`) for info/success. A caller may **swap** the glyph but may not remove it for these states. This is the "Error/warning states carry a bold status glyph" rule in `CLAUDE.md`.

The reference implementation already lives in the codebase: **`Alert`** (`packages/core/src/Alert/Alert.tsx`, the `VARIANTS` map) and **`Toast`** (`Toast/Toast.tsx`, the `TOAST_ICONS` map) both map each intent to a glyph and render it `aria-hidden weight="bold"`. Mirror that shape — do **not** invent a new glyph, a new weight, or a per-component icon convention.

## The glyph vocabulary (fixed)

| State | Glyph | Weight | Import |
|---|---|---|---|
| info | `Info` | `bold` | `@phosphor-icons/react/dist/ssr` |
| success | `CheckCircle` | `bold` | `@phosphor-icons/react/dist/ssr` |
| warning / caution | `Warning` (triangle) | `bold` | `@phosphor-icons/react/dist/ssr` |
| error / danger / critical / invalid | `WarningOctagon` | `bold` | `@phosphor-icons/react/dist/ssr` |

Type-only glyph refs use `import type { Icon as PhosphorIcon } from "@phosphor-icons/react"`.

## When this fires

- Adding or editing a component with an error/warning/danger/critical intent or an `error`/`invalid` prop.
- Auditing whether an existing status surface complies (e.g. Badge, Field derivatives).
- The guard `packages/core/src/error-warning-icon.test.tsx` fails — a new error/warning surface shipped without a glyph.

**Already compliant, do not touch:** `Alert`, `Toast`. **The known gaps this rule closed:** `Badge` (danger/warning intents), `Field` (+ TextField/CurrencyField/CredentialField, which compose it). Downstream `fintech-react` (`AlertsFeed`, `GovernedActionDialog`, `SecureWireDialog`, `InsightCard`) render `<Badge>`/`<Alert>` and **inherit** compliance — fix the primitive, not the consumer.

## Recipe

1. **Find the state axis.** Identify the prop that expresses severity — a variant/intent union (`"danger" | "warning" | …`) or a boolean/`error` prop (like `Field`'s `error?: ReactNode`).
2. **Add an intent→glyph map** next to the component, mirroring `Alert.tsx` `VARIANTS`:
   ```ts
   import { Warning, WarningOctagon } from "@phosphor-icons/react/dist/ssr";
   import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
   const INTENT_ICONS: Partial<Record<Intent, PhosphorIcon>> = {
     danger: WarningOctagon,
     warning: Warning,
   };
   ```
   For a boolean error surface (Field), there's one glyph — just render `WarningOctagon` when `invalid`.
3. **Render it `aria-hidden weight="bold"`** in the same slot as the text, with a `styles.icon` (or `styles.errorIcon`) class. Preserve any caller override: `explicit icon prop → intent default → (dot/none)`. Never let the override *remove* the glyph for danger/warning.
4. **Style the slot** in `<Name>.module.css`: size it to the text line-height, `flex-shrink: 0`, inherit color via `currentColor` (the intent fg) — **no raw color**, only `var(--sina-*)` with a codemod fallback (`node scripts/codemod-tokens.mjs`).
5. **Extend the guard** `packages/core/src/error-warning-icon.test.tsx`: render the new surface in its error/warning state and assert `container.querySelector("svg")` is present.
6. **Show it in the playground** (`apps/playground`) so the state is visible for `/preview-change` and `/figma-component-coverage`.
7. **Mirror into Figma** via `/primitive-figma-sync` — place the `Warning`/`WarningOctagon` glyph in the danger/warning cells / error state. Badge/Alert/Toast ride a per-status ink token (`--sina-color-status-fg--<status>`, default black) on a vivid fill, so the glyph paint matches the label via `currentColor`/the shared fg channel (no per-intent fg override needed). Run `/figma-component-coverage` as the acceptance test.

## Reuses

- `packages/core/src/Alert/Alert.tsx` — the canonical `VARIANTS` intent→glyph map + render.
- `packages/core/src/Toast/Toast.tsx` — `TOAST_ICONS` map (same shape, forwardRef component).
- `Icon` house style — `weight="bold"` for status glyphs, see `packages/core/src/Icon/Icon.tsx`.
- The guard test + `packages/core/CSS_TOKENS.md` token cheat-sheet.

## Verify

```
pnpm --filter @sina-design-system/core lint typecheck test   # guard passes; jest-axe still green
node scripts/verify-tokens.mjs                                # no raw color / fallback-less var() in new CSS
pnpm --filter @sina-design-system/core build                 # then /preview-change before any visual check
```

## Gotchas

- **Don't remove `dot`/override affordances for non-severity intents** — the rule is scoped to error/warning/danger; success/info/neutral keep their existing behavior.
- **`weight="bold"`, not `fill`** — the status glyph set (`Info`/`CheckCircle`/`Warning`/`WarningOctagon`) is authored bold to read on the vivid fill.
- **Fix the primitive, not the consumer** — `fintech-react` severities route through `Badge`/`Alert`; patching a consumer duplicates the glyph and drifts.
