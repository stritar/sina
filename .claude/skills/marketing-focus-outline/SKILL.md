---
name: marketing-focus-outline
description: Ensure every marketing (Broadsheet) component auto-inherits the single global blue accessibility focus outline. Use when adding or editing a component under apps/web/app/(marketing)/broadsheet/, when asked to "add the focus outline", "the marketing button has no focus ring", "make the focus blue", or when the marketing-focus guard test fails.
---

> **The invariant:** the marketing system has **one** blue focus outline, assigned **automatically**. A single rule in `apps/web/app/(marketing)/broadsheet/broadsheet.css`
> ```css
> [data-broadsheet]:focus-visible {
>   outline: 2px solid var(--sinamk-color-focus-ring, #2563eb);
>   outline-offset: 2px;
> }
> ```
> gives the outline to any element carrying `data-broadsheet` on keyboard focus. Components **never author their own** `:focus-visible`. This is the "Marketing components inherit one global blue focus outline" rule in `CLAUDE.md`.

The reference implementations live in `packages`-free marketing code: `ButtonSecondary.tsx` and `IconButton.tsx` both render a native `<button>` whose root has `data-broadsheet=""`. Mirror that — do not add a per-component outline, a different color, or a different offset.

## When this fires

- Adding or editing any component under `apps/web/app/(marketing)/broadsheet/`.
- A marketing control shows no focus ring, or the wrong color, on keyboard Tab.
- The guard `apps/web/app/(marketing)/broadsheet/marketing-focus.test.tsx` fails — a registered component shipped without the marker, the token drifted from `#2563eb`, or a module authored its own `:focus-visible`.

## Recipe

1. **Mark the focusable root.** Put `data-broadsheet=""` on the component's interactive root element (the `<button>`, `<a>`, or the wrapper that receives focus). That attribute is the *only* thing a component needs to earn the outline.
2. **Do not author focus styles.** No `:focus-visible`, no `outline` on `:focus`, in the component `*.module.css`. A preview-only forced state (`[data-force-state="focus"]`) that mimics the ring for the showcase is allowed because it is not `:focus-visible`; keep it referencing `var(--sinamk-color-focus-ring, #2563eb)`.
3. **Register the component** in `broadsheet/registry.tsx` so the guard renders it and asserts the marker reached the DOM (the guard is registry-driven).
4. **Keep the token.** The blue is `--sinamk-color-focus-ring` in `broadsheet.css` (`#2563eb` light, a brighter blue in the `[data-theme="dark"] .broadsheet` block). Change it there, once, never per component.

## Verify

```
pnpm --filter web exec vitest run marketing-focus     # the guard passes
```
Then keyboard-Tab through `/showcase` and confirm the blue ring appears (2px, 2px offset) on every control.

## Gotchas

- **The marker is on the ROOT that receives focus**, not a child span. If you wrap the button, the `<button>` still needs it.
- **Chrome vs. component.** The showcase's own controls (`showcase/Sandbox.module.css`) are page chrome, not Broadsheet components, so they may style `:focus-visible` directly with `var(--sinamk-color-focus-ring)`. The guard only governs `broadsheet/*.module.css`.
- **Do not raise specificity to beat the global rule.** If a component needs a different focus treatment, that is a foundation decision — change the token or the single rule, do not fork it.
- Pairs with `/broadsheet-foundations` (token discipline) and `/new-marketing-component` (scaffolder).
