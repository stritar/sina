---
name: figma-component-coverage
description: Enforce that every component added to or updated in the SINA Figma file displays ALL of its props — full variant matrix plus a coverage frame demonstrating each boolean/instance-swap/text property. Use when building or editing a Figma component (Button, Badge, Field, …), when asked to "add a component to Figma", "update the Figma component", or "show all states/props".
---

> **Binding rule:** a component is not done until **every prop it exposes is visibly demonstrated** on the canvas. A prop a reviewer can't see is a prop that silently rots. This applies to new components and to any edit that adds/removes/renames a prop.

The SINA Figma file is `mvicg1WNyYIeeLckLq2BSq` (see [[sina-figma-file]]). Components live one-per-page under the `——— COMPONENTS ———` section. Before any write, load the **`figma-use`** guidance (MANDATORY): read the `skill://figma/figma-use/SKILL.md` MCP resource, and `skill://figma/figma-use/references/component-patterns.md` for variants/properties. Honour the repo's hard rules in `CLAUDE.md` (hex-only colors → bind to existing **variables**, never raw values; strict spacing grid → bind to `space/*` tokens).

## What "display all props" means

A component's prop surface has two kinds of property; both must be shown:

1. **VARIANT properties** (real component props — e.g. `Variant`, `Size`, `Intent`, `appearance`) → exhaustively, as the **component-set matrix itself**. Every combination is one variant row/column. Missing combinations show as blank gaps in Figma's picker — fill them all. **Interaction states (hover / active / focus-visible / disabled / loading) are NOT a variant axis** (v2 model): a Figma boolean drives visibility, not color, so states are runtime styling shown in a separate **States strip** of override instances. Variant *values* mirror the code (lowercase: `primary`, `sm`, …).
2. **Non-variant properties** — `BOOLEAN` (toggles), `INSTANCE_SWAP` (e.g. icon glyph), `TEXT` (label), `SLOT` → these don't multiply the matrix, so they must be demonstrated in a separate **coverage frame** of instances, one instance per meaningful prop combination (e.g. icon none / left / right / both).

## Recipe

1. **Enumerate the full prop surface first.** Inspect the existing component (or the code component it mirrors) and list every property + every value:
   - Read code variants (e.g. `buttonVariants` in `packages/core/src/<Name>/<Name>.tsx`) so Figma matches the implementation's variant/size/state names exactly.
   - In Figma, dump `componentPropertyDefinitions` on the set (see `component-patterns.md` → "Inspect an existing component set"). Confirm the list is complete before building.
2. **Build the variant matrix exhaustively.** Create one `COMPONENT` per VARIANT-property combination, then `figma.combineAsVariants(...)`. Name each `Prop=Value, Prop=Value, …` matching the existing convention in the file. Lay variants out in a readable grid (one axis per variant property) and `resizeWithoutConstraints` the set from child bounds — un-positioned variants collapse to (0,0).
3. **Wire non-variant props once, let them merge.** Add identical `BOOLEAN` / `INSTANCE_SWAP` / `TEXT` properties (same name + type) to a template component, then **clone** it for every matrix cell — clones preserve property keys and `componentPropertyReferences`, so `combineAsVariants` merges them into one set-level property. Link each to its child node (`visible` → BOOLEAN, `mainComponent` → INSTANCE_SWAP, `characters` → TEXT).
4. **Add the coverage frame.** Next to the set, build an auto-layout frame named `<Component> — coverage` containing instances that exercise each non-variant prop in every meaningful combination (booleans on/off, an instance-swap example, a long-label example, the empty/icon-only case). Label it so a reviewer sees at a glance which prop each instance demonstrates.
5. **Pin the display mode.** Set the component set's explicit mode for the Color collection to **Light** (`setExplicitVariableModeForCollection`) so it renders in the doc's mode and doesn't fall back to a different default — a common cause of "everything looks black/wrong".
6. **Write a `description`** on the set summarizing its props and any model notes (e.g. spacing lives on the label, leave label empty for icon-only).

## Verification (mandatory — a prop with no rendered example fails)

- `get_metadata` / read `componentPropertyDefinitions` on the set: confirm **every** declared property appears and every VARIANT value has a variant.
- `get_screenshot` (or `await node.screenshot()`) the set **and** the coverage frame: confirm every variant cell renders correctly (no blank/black cells, no missing fills) and that **each non-variant prop is visibly demonstrated** in the coverage frame.
- Cross-check against the code component's variant/prop names — they must agree.

## Reuses / reference

- Existing exemplar: the **Button** family (page `7:4`, rebuilt v2 2026-06-28) — a `Variant × Size` (16-cell) set + `Icon Left` / `Icon Right` booleans (each with an `INSTANCE_SWAP` glyph) + a `Label` text prop; a **States strip** (default / hover / active / focus-visible / disabled / loading as override instances); a coverage frame; and a full documentation block. Every family page follows the same rhythm: **Title → Variants → States strip → Coverage → Documentation**. Mirror it. (Component sheets are pinned to the Color collection's Light mode; tagged `setSharedPluginData('dsb','key','component/<name>')`.)
- `figma-use` skill (API rules) + `component-patterns.md` (variants, `addComponentProperty`, `componentPropertyReferences`, `combineAsVariants`).
- Memory: [[sina-figma-file]], [[sina-figma-use-gotchas]], [[sina-strict-tailwind-grid]].
