# SINA CSS Modules — conversion cheat-sheet

The one reference for converting a primitive (or governed component) from Tailwind
utility strings to a co-located `<Name>.module.css` CSS Module. Tailwind is gone;
every value resolves from the `--sina-*` tokens in `packages/theme/theme.css`.

## Recipe (per component)

1. Create `<Name>.module.css` next to `<Name>.tsx`. Flat class names (`.root`,
   `.primary`, `.sm`, `.iconLeft`) — **no BEM, no CSS nesting**. Real pseudo-classes
   for state (`.primary:hover:not(:disabled)`, `.root:focus-visible`) and Radix
   data-attributes (`.content[data-state="open"]`).
2. In `<Name>.tsx`: `import styles from "./<Name>.module.css";` and compose with the
   `cn()` helper (now just `clsx`): `className={cn(styles.root, styles[variant], className)}`.
3. **Per-component token layer** (mirrors remarkable-sandbox): declare
   `--sina-<name>-*` aliases of the semantic tokens in a `:root` block, and consume
   them in the rules. Name them per the grammar in `packages/theme/TOKEN_NAMING.md`
   — single `-` for the identity path (component, slot, property), double `--`
   before a variant/state modifier, which comes **after** the property:
   `--sina-button-bg--primary--hover`, `--sina-checkbox-bg--checked`. Leave the
   fallbacks OFF — run `node scripts/codemod-tokens.mjs` to inject the resolved
   `#hex`/length fallbacks. Example:
   ```css
   :root {
     --sina-button-bg: var(--sina-color-primary);
     --sina-button-fg: var(--sina-color-primary-fg);
   }
   .primary { background: var(--sina-button-bg); color: var(--sina-button-fg); }
   ```
   After the codemod: `--sina-button-bg: var(--sina-color-primary, #353b31);` etc.
4. `cva(...)` → base rules on `.root`; each variant/size value → its own class;
   `defaultVariants` become `variant ?? "primary"` in the `.tsx`. **Drop** any
   exported `*Variants` function and replace `VariantProps<typeof x>` with a
   hand-authored prop union.
5. Never write a raw color (`#hex`/`rgb()`) except as a codemod-injected `var()`
   fallback. `node scripts/verify-tokens.mjs` enforces this.

## Utility → CSS token map

Read left (old Tailwind utility) → write right (CSS declaration). `X` = a token role.

### Color
| Tailwind | CSS |
|---|---|
| `bg-primary` / `text-primary-fg` / `border-border` | `background: var(--sina-color-primary)` / `color: var(--sina-color-primary-fg)` / `border-color: var(--sina-color-border)` |
| `bg-danger` `text-danger` `bg-danger-bg` `text-danger-fg` | `var(--sina-color-danger)` / `…-danger` / `…-danger-bg` / `…-danger-fg` (same for success/warning/info) |
| `bg-surface` `bg-surface-raised` `bg-surface-sunken` `bg-surface-secure` | `var(--sina-color-surface[-raised|-sunken|-secure])` |
| `text-text` `text-text-muted` `text-text-subtle` `text-text-inverse` | `var(--sina-color-text[-muted|-subtle|-inverse])` |
| `border-border-subtle` | `var(--sina-color-border-subtle)` |
| `bg-secondary` `bg-secondary--hover` `text-secondary-fg` | `var(--sina-color-secondary[--hover|-fg])` — state → `--`, `-fg` is a role |
| **`/alpha` modifier** `bg-danger/90` `border-danger/40` | `color-mix(in srgb, var(--sina-color-danger) 90%, transparent)` (percent = the modifier; keep `in srgb`) |
| `bg-current/10` | `color-mix(in srgb, currentColor 10%, transparent)` |
| `bg-hover` `bg-pressed` `bg-selected` (overlays) | `var(--sina-overlay--hover|pressed|selected)` — already translucent, **don't** wrap again |
| `bg-chart-1` … `bg-chart-8` | `var(--sina-color-chart--1 … --8)` |

### Sizing / spacing (control dims)
| Tailwind | CSS |
|---|---|
| `size-control-2xs / -xs / -sm / -md / -lg / -xl` | `width` + `height: var(--sina-size--icon-sm / xs / sm / md / lg / xl)` |
| `p-3` `px-1` `py-0.5` `gap-2` `mt-3` `h-7` `w-px` | `var(--sina-space--3 / 1 / 0_5 / 2 / 3 / 7)`; `h-7` = `height: var(--sina-space--7)`; `w-px` = `width: 1px` |
| half-steps `0.5` `1.5` `2.5` | `--sina-space--0_5` `--sina-space--1_5` `--sina-space--2_5` |
| `size-3` `size-1.5` `size-5` (bare, off the `spacing` scale) | `width`+`height: var(--sina-space--3 / 1_5)`; `size-5` = `1.25rem` (`--sina-space--5`) |

### Radius / border-width
| Tailwind | CSS |
|---|---|
| `rounded-md` `rounded-lg` `rounded-full` `rounded-sm` `rounded-xs` | `border-radius: var(--sina-radius--md / lg / full / sm / xs)` |
| bare `border` | `border-width: var(--sina-border-width--1)` (1px) |
| `border-0` `border-2` `border-4` | `var(--sina-border-width--0 / 2 / 4)` |

### Type
| Tailwind | CSS |
|---|---|
| `text-ui` | `font-size: var(--sina-text--ui); line-height: 1.125rem; letter-spacing: -0.006em` |
| `text-xs / -sm / -base / -lg / … / -5xl` | `font-size: var(--sina-text--xs / sm / base / lg / … / 5xl)` |
| `font-normal / -medium / -semibold / -bold` | `font-weight: var(--sina-font-weight--regular / medium / semibold / bold)` |
| `font-mono` `font-sans` | `font-family: var(--sina-font--mono / sans)` |
| `leading-tight / -snug / -normal …` | `line-height: var(--sina-leading--tight / snug / normal …)` |
| `tracking-tight / -wide` | `letter-spacing: var(--sina-tracking--tight / wide)` |

### Shadow / z / motion / focus
| Tailwind | CSS |
|---|---|
| `shadow-xs / -sm / -md / -lg / -xl` | `box-shadow: var(--sina-shadow--xs / sm / md / lg / xl)` |
| `shadow-focus` | `box-shadow: var(--sina-shadow--focus)` |
| `z-dropdown / -overlay / -modal / -toast` | `z-index: var(--sina-z--dropdown / overlay / modal / toast)` |
| `duration-fast / -base / -instant / -slow` | `transition-duration: var(--sina-duration--fast / base / instant / slow)` |
| `ease-standard / -out` | `transition-timing-function: var(--sina-ease--standard / out)` |
| `focus-visible:ring-2 ring-focus-ring ring-offset-1 ring-offset-bg` | `outline: none; box-shadow: 0 0 0 1px var(--sina-color-bg), 0 0 0 3px var(--sina-color-focus-ring)` (share via `composes` from `styles/focus.module.css`) |

### State variants
| Tailwind | CSS |
|---|---|
| `hover:X` `active:X` `disabled:X` `focus-visible:X` | `.cls:hover {}` `:active {}` `:disabled {}` `:focus-visible {}` — guard interactive with `:not(:disabled)` |
| `data-[state=open]:X` | `.cls[data-state="open"] { … }` |
| `motion-reduce:animate-none` | not needed — `--sina-duration--*` is already `0ms` under `prefers-reduced-motion` at the token layer |

### Structural utilities (no token — write the raw CSS)
`inline-flex` → `display: inline-flex`; `items-center` → `align-items: center`;
`justify-center` → `justify-content: center`; `justify-end` → `justify-content: flex-end`;
`flex-col` → `flex-direction: column`; `shrink-0` → `flex-shrink: 0`; `whitespace-nowrap`
→ `white-space: nowrap`; `w-full` → `width: 100%`; `h-full` → `height: 100%`;
`self-stretch` → `align-self: stretch`; `relative`/`absolute` → `position: …`;
`pointer-events-none` → `pointer-events: none`; `overflow-hidden` → `overflow: hidden`.
The `[&_svg]:size-full` pattern → `.glyph svg { width: 100%; height: 100% }`.

## Animations (replacing `tailwindcss-animate`)

Radix `data-[state]` surfaces used `animate-in fade-in-0 zoom-in-95 slide-in-from-*`
+ `data-[state=closed]:animate-out`. Hand-author `@keyframes` per surface, driven by
`--sina-duration--*` / `--sina-ease--out` (reduced-motion handled at the token layer):

```css
@keyframes sinaOverlayIn { from { opacity: 0 } to { opacity: 1 } }
@keyframes sinaContentIn {
  from { opacity: 0; transform: translate(-50%, -48%) scale(0.96) }
  to   { opacity: 1; transform: translate(-50%, -50%) scale(1) }
}
.overlay[data-state="open"]  { animation: sinaOverlayIn var(--sina-duration--base) var(--sina-ease--out) }
.overlay[data-state="closed"]{ animation: sinaOverlayIn var(--sina-duration--base) var(--sina-ease--out) reverse }
.content[data-state="open"]  { animation: sinaContentIn var(--sina-duration--base) var(--sina-ease--out) }
.content[data-state="closed"]{ animation: sinaContentIn var(--sina-duration--base) var(--sina-ease--out) reverse }
```
Radix `Presence` waits for `animationend`, so BOTH `open` and `closed` need a real
animation or exit won't be delayed.

## Verify

- `node scripts/codemod-tokens.mjs` — inject/refresh fallbacks.
- `node scripts/verify-tokens.mjs` — no raw colors, every managed `var()` has a fallback.
- `pnpm --filter @sina-design-system/core build` — emits `dist/*.js` + `dist/styles.css`; confirm `"use client"` survives on client modules.
