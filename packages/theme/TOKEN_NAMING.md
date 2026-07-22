# SINA token naming grammar

The rule for naming every `--sina-*` CSS custom property — theme tokens in
[`theme.css`](./theme.css) **and** the per-component token layers in each
`*.module.css`. It mirrors the `--em-*` grammar from `remarkable-sandbox`
(`rules/prototypes/variable-naming.yaml`), adapted for SINA.

The one-line version: **single `-` joins identity; double `--` precedes a leaf
modifier, which always comes last.**

## Canonical shape

```
--sina-<category|component>[-<sub-role|slot>…][-<property>][--<variant>][--<size>][--<state>]
        └──────────── single-dash identity path ────────────┘└──── double-dash leaf modifiers ────┘
```

## The seven rules

1. **Prefix.** Every token starts `--sina-`.
2. **Single `-` joins identity segments** — the parts that together name *what the
   token is*: category (`color`, `space`, `radius`), semantic role & sub-role
   (`text`, `text-muted`, `surface-raised`, `primary-fg`, `border-subtle`,
   `focus-ring`), component (`button`, `credential-field`), slot (`icon`,
   `title`, `thumb`, `close`), and **multi-word property names** (`border-color`,
   `bg`, `fg`).
3. **Double `--` precedes a leaf modifier** — a value on an axis the token varies:
   - **scale step:** `--50 … --950`, `--md`, `--xl`, `--0_5`
   - **variant:** `--primary`, `--secondary`, `--danger`, `--info`, `--success`,
     `--good`, `--credit`
   - **size:** `--sm`, `--md`, `--lg`
   - **state:** `--hover`, `--active`, `--pressed`, `--disabled`, `--selected`,
     `--checked`
4. **Order.** Modifiers always follow the property/identity, in the order
   `variant → size → state`. Stacking is allowed: `bg--primary--hover`.
5. **Role vs. modifier — the test.** A **role/sub-role** is a fixed slot the token
   *always is* (a card's muted text, a raised surface, the `fg`, the
   `focus-ring`) → single-dash identity. A **variant/state** is a value *selected
   at runtime* by a prop or by interaction (`variant="danger"`, `:hover`) →
   double-dash modifier. Ask: *"does a variant prop or a pseudo-class select
   it?"* If yes, it's a modifier.
6. **Atomic-role exceptions.** `focus-ring` and `focus-visible` stay single-dash
   even though they read like a state — they name the focus *indicator element*,
   not a `focus` state of some other property.
7. **Colors in hex.** Color values are authored `#rrggbb` (or `#rrggbbaa`). See
   the hex guard in [`src/tokens.test.ts`](./src/tokens.test.ts).

## Correct / incorrect

| Correct | Incorrect | Why |
|---|---|---|
| `--sina-color-primary--hover` | `--sina-color-primary-hover` | state is a modifier → `--` |
| `--sina-space--4` | `--sina-space-4` | scale step is a modifier → `--` |
| `--sina-button-bg--primary` | `--sina-button-primary-bg` | modifier comes *after* the property |
| `--sina-button-bg--primary--hover` | `--sina-button-primary-bg-hover` | property first, then `--variant--state` |
| `--sina-checkbox-bg--checked` | `--sina-checkbox-checked-bg` | `checked` is a state modifier |
| `--sina-color-text-muted` | `--sina-color-text--muted` | `text-muted` is a **role**, not a variant (see below) |
| `--sina-color-focus-ring` | `--sina-color-ring--focus` | `focus-ring` is an atomic role |
| `--sina-toast-close-bg--hover` | `--sina-toast-close-hover-bg` | state trails the property, never mid-name |

## SINA divergence from remarkable (intentional)

remarkable models de-emphasis tones as runtime variants: `--em-sem-text--muted`.
**SINA does not.** SINA authors `text-muted`, `text-subtle`, `surface-raised`,
`surface-sunken`, and the `*-fg` / `*-bg` sub-roles as **independent,
individually-themed roles** with single-dash names, because each carries its own
hex in light **and** dark and is referenced by the a11y contrast test and the
governance lock. Only interaction **states** on the semantic color roles use `--`
(`primary--hover`, `primary--active`, `secondary--hover`) — matching the existing
`overlay--hover / --pressed / --selected` precedent.

So at the **semantic layer**, only states are `--`. At the **component layer**,
both variants and states are `--` modifiers, reordered after the property.

## Enforcement

A guard in [`src/tokens.test.ts`](./src/tokens.test.ts) scans `theme.css` and
every `packages/{core,fintech-react}/src/**/*.module.css`, and fails the build if
a known state word (`hover, active, pressed, disabled, selected, checked, open,
expanded, invalid`) follows a single dash. `focus` is deliberately excluded so
`focus-ring` passes.
