---
name: no-nested-status
description: De-nest a status element (Alert/Toast/Badge) rendered inside another status element, and add the guard case. Use when asked to "the badge is inside the alert", "de-nest the badge", "status inside a status", "the warning banner has a badge in it", when building/editing any component that renders an Alert/Toast/Badge, or when the status-nesting guard test fails.
---

> **The invariant:** a status element — `Alert`, `Toast`, or `Badge` (`@sina-design-system/core`) — communicates one self-contained intent and must **never** be rendered **inside** another status element. No `Badge` in an `Alert`, no `Alert` or `Badge` in a `Toast`. Nesting double-encodes intent, muddies a11y roles (`Alert` and `Toast` both render `role="status"`), and reads as a design bug. Compose them as **siblings**: a **text-only** `Alert` with any severity `Badge`s in a sibling row **beneath** it. This is the "Never nest status elements inside one another" rule in `CLAUDE.md`.

The reference implementation already lives in the codebase: **`BlockedState`** (`apps/playground/app/(emulator)/_components/BlockedState.tsx`) renders a text-only `<Alert variant="danger">` and puts the per-violation severity `Badge`s in a **sibling** `styles.violations` block — never inside the Alert. Mirror that shape. Each core status root carries a `data-sina-status` marker (`alert`/`toast`/`badge`) so the guard can detect nesting.

## The shape (fixed)

| Wrong (nested) | Right (siblings) |
|---|---|
| `<Alert>…<Badge/>…</Alert>` | `<Alert>{text}</Alert>` then `<Badge/>` beneath it |
| Alert body carries the badge list | Alert body is text; a sibling `styles.violations` list carries the badges |

The `data-sina-status` markers live on the roots of `Alert.tsx`, `Toast.tsx`, `Badge.tsx` in `packages/core/src`. Do **not** remove them — the guard queries `[data-sina-status] [data-sina-status]`.

## When this fires

- A status surface renders a `Badge` (or `Alert`/`Toast`) inside another status element — most often a severity/metric `Badge` inside a warning/info `Alert`.
- Building or editing any `fintech-react` component that composes `Alert` + `Badge` (governed dialogs, insight/summary cards).
- The guard `packages/fintech-react/src/status-nesting.test.tsx` fails — a new status surface shipped with a nested status element.

**Already compliant, use as reference:** `BlockedState.tsx`, `MandatoryDisclosure.tsx` (text-only Alert). **The gaps this rule closed:** `GovernedActionDialog`, `SecureWireDialog` (severity Badge moved out of the "Why this is blocked" Alert into a sibling `styles.violations` list), `InsightCard` (metric Badge moved out of the Alert into a sibling row).

## Recipe

1. **Find the nesting.** Locate the status element that renders another inside it. Grep for a `<Badge` (or `<Alert`/`<Toast`) between an `<Alert …>`/`<Toast …>` open and close tag. The guard failure message names the surface.
2. **Make the outer element text-only.** The `Alert` (or `Toast`) body becomes a string / plain text nodes — its title + description. Move any conditional-vs-fallback branch to plain strings.
3. **Move the inner status elements to a sibling.** Render the `Badge`(s) in a sibling block **after** the Alert, at the same level (inside the parent `Stack`/`div`). For a list, use `<Stack as="ul" className={styles.violations}>` with `styles.violationRow` rows (Badge + message); add `.violations { list-style: none; margin: 0; padding: 0; }` to the module.
4. **Keep the intent readable without the wrapper.** The relocated `Badge` still carries its own intent glyph (danger/warning), so meaning survives outside the Alert — do not weaken it to tint-only.
5. **Add a case to the guard** `packages/fintech-react/src/status-nesting.test.tsx`: render the surface (opening any dialog to its review phase with `userEvent`), then assert `document.body.querySelector("[data-sina-status] [data-sina-status]")` is `null` and at least one `[data-sina-status]` is present.
6. **Rebuild `dist` before any visual check** (`/preview-change`) — apps consume `dist`, not `src`, so the emulator serves the old nested layout until `core` + `fintech-react` are rebuilt.
7. **Mirror into Figma** via `/primitive-figma-sync` — the corrected component shows a text-only Alert with the Badge as a separate row beneath (see node `200-2272`). Run `/figma-component-coverage` as the acceptance test.

## Reuses

- `apps/playground/app/(emulator)/_components/BlockedState.tsx` — the canonical text-Alert + sibling-Badge layout.
- `packages/fintech-react/src/GovernedActionDialog/GovernedActionDialog.tsx` — the fixed governed-dialog review block (`styles.violations` sibling list).
- `packages/fintech-react/src/status-nesting.test.tsx` — the guard; add a case per new surface.
- `packages/core/src/{Alert,Toast,Badge}/*.tsx` — the `data-sina-status` markers the guard keys off.

## Verify

```
pnpm --filter @sina-design-system/core build                          # data-sina-status markers into dist
pnpm --filter @sina-design-system/fintech-react lint typecheck test   # status-nesting guard passes; jest-axe still green
pnpm --filter @sina-design-system/fintech-react build                 # then /preview-change before any visual check
```

## Gotchas

- **`Alert` and `Toast` both render `role="status"`** — a role-only check is ambiguous; the guard keys off the `data-sina-status` marker, not the role.
- **Dialogs portal to `document.body`** — query the whole document in the guard, not the `render()` `container`, and open the dialog (click its trigger) to reach the review phase where badges render.
- **Fix the composition, not the primitive** — `Alert`/`Badge` are correct on their own; the bug is only in how a consumer nests them. Don't add nesting-prevention logic into the primitives beyond the inert `data-sina-status` marker.
- **Don't drop information when de-nesting** — the message text and severity that lived in the Alert must still render (as a sibling row), not disappear.
