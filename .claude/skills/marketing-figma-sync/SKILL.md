---
name: marketing-figma-sync
description: Recreate/sync a marketing (Broadsheet) component into the SINA-marketing Figma file, and back — the marketing twin of /primitive-figma-sync. Use after adding or editing a component under apps/web/app/(marketing)/broadsheet/** (variants, sizes, props, tokens, anatomy, a11y) to mirror it into Figma, and after editing the marketing Figma component to mirror it back into code. Triggers: "recreate the marketing component in figma", "sync the marketing component to figma", "we changed <marketing component>, update figma", or any Broadsheet change that alters its visible prop surface. NOT for packages/core primitives — those use /primitive-figma-sync.
---

> A Broadsheet component in `apps/web/app/(marketing)/broadsheet/**` and its component on the **SINA-marketing** Figma file are one source of truth in two places. This skill keeps them in lockstep, both directions. It fires on **prop-surface changes** (a size/variant/state axis, a prop, a token, anatomy, an interaction state) — an internal refactor with no visible change doesn't trigger it. This is the **marketing** flow: the target file is `oanAjqh5ei2L5BDURxnEi4`, page `12:8` — **NOT** the product file that `/figma-component-coverage` and `/primitive-figma-sync` hardcode.

## When this fires

- A component was added or edited under `apps/web/app/(marketing)/broadsheet/` and its prop surface changed (code → Figma).
- The marketing Figma component changed and code must catch up (Figma → code).
- NOT for `packages/core` primitives (`/primitive-figma-sync`) and NOT the product Figma file. Broadsheet is standalone marketing on the `--sinamk-*` foundation.
- Direction is chosen by **who changed last**; if both changed, surface the conflict rather than overwrite.

## Coordinates (SINA-marketing)

- **File:** `oanAjqh5ei2L5BDURxnEi4` (name: `SINA-marketing`). **Components page:** `12:8` ("▸ Components").
- **Layout:** component **sets** stack in a column at **x=3900**, each **976×302**, on a **347px vertical rhythm**; a matching `Coverage / <Name>` frame sits at **x≈4520**. Last placed: Theme Switcher set `69:339` at (3900, 2318) + `Coverage / Theme Switcher` `70:159` at (4520, 2318). The next free rhythm slot is **y ≈ 2665**.
- **Variant axes** use Capitalized values (`Size=Medium`, `Selected=List`). The established shape is `Size × <one-more-axis>` (Theme Switcher used `Size × Value`).
- **Bound variable IDs:** `action/secondary`=8:6, `action/secondary--hover`=8:7, `surface/surface`=7:4, `border/border`=7:11, `text/text`=7:7, `text/text-muted`=7:8. The MK collections' mode-id field is **`modeId`** (not `id`).
- Tag the set: `setSharedPluginData('dsb','key','component/<name>')`; pin the set to the Color collection's **Light** mode after edits.

See [[marketing-design-system-figma]] for the full foundations inventory and history.

## Before any Figma write (mandatory)

1. **Load `figma-use` guidance** — read the MCP resources `skill://figma/figma-use/SKILL.md` and `skill://figma/figma-use/references/component-patterns.md`.
2. **Batch-load the Figma tool schemas in one `ToolSearch`** (they are deferred): `select:use_figma,get_screenshot,get_metadata,get_variable_defs`. To create a set from scratch you drive the Plugin API through `use_figma` (`figma.combineAsVariants`, `addComponentProperty`, `componentPropertyReferences`, `setExplicitVariableModeForCollection`, `setSharedPluginData`). Read-only calls (`get_screenshot`/`get_metadata`/`get_variable_defs`) are pre-allowed; `use_figma` will prompt.

## Recipe — Direction A (code → Figma)

1. **Enumerate the full prop surface** from the component's props type + its `registry.tsx` controls schema (the controls axes are the source of truth for what must be shown).
2. **Locate or create the set** on page `12:8`. Read `figma.root.children` (a read-only `use_figma` scan — `get_metadata` under-reports pages) to find an existing `Coverage / <Name>` / set by name or its `dsb` key.
3. **Build the variant matrix.** One COMPONENT per cell, named `Prop=Value, Prop=Value` (Capitalized), `figma.combineAsVariants(...)`, `resizeWithoutConstraints` from child bounds. Interaction states (hover/pressed/focus/disabled/loading) are **NOT** a variant axis — put them in a **States strip** of override instances, per `/figma-component-coverage`.
4. **Wire non-variant props** (BOOLEAN / INSTANCE_SWAP / TEXT / SLOT) on a template, then clone per cell (clones preserve property keys → they merge into one set-level prop). Reference: `visible`→BOOLEAN, `mainComponent`→INSTANCE_SWAP, `characters`→TEXT.
5. **Add the coverage frame** `Coverage / <Name>` (auto-layout) at x≈4520 demonstrating every non-variant prop across sizes.
6. **Match the raw-value gotchas** (existing marketing components use raw geometry + raw code hex, not the radius/size tokens): secondary fill `#e9ece8`, surface `#ffffff`, border `#dfe4de`, text `#353b31`, muted `#6b7268`; track radius 6 / inner radius 4. **Focus preview uses raw `#2563eb`**, never the forest `a11y/focus-ring` variable.
7. **Run `/figma-component-coverage` as the acceptance test** — every prop must be visibly demonstrated (but override its product-file target with the marketing file/page above).
8. **Update the [[marketing-design-system-figma]] memory** with the new set + coverage-frame node ids and the y-slot used.

## Recipe — Direction B (Figma → code)

1. Diff the Figma set's `componentPropertyDefinitions` against the component's props + `registry.tsx` controls.
2. Map Figma axes back to the code: variant axes → the `data-size` / discriminated props; boolean/instance-swap/text → the optional props; keep names lowercase in code (`sm`, not `Small`).
3. Apply the delta inside the Broadsheet boundary: **no `@sina-design-system/*` imports**, `--sinamk-*` tokens only (with fallbacks), `data-broadsheet` on the focusable root, no authored `:focus-visible`.
4. Update the `registry.tsx` spec so the showcase controls and the guards track the new surface.

## Verification (both directions)

- Names agree 1:1 — the Figma variant/prop names map to the `registry.tsx` control axes.
- `get_screenshot` the set **and** the `Coverage / <Name>` frame; eyeball parity.
- Code side: `pnpm --filter web exec vitest run broadsheet` (a11y + focus + foundations guards), `pnpm --filter web typecheck lint`, and `pnpm --filter web pages:build` (stays Cloudflare-static-safe).

## Reuses

- [[marketing-design-system-figma]] — the authoritative placement + token-binding conventions and history.
- `/figma-component-coverage` — the "every prop is demonstrated" acceptance test (retarget it to the marketing file/page).
- `/broadsheet-foundations`, `/marketing-focus-outline` — the code-side rules to hold when applying a Figma → code delta.
- `apps/web/app/(marketing)/broadsheet/registry.tsx` — the controls schema that defines the axes to mirror.

## Gotchas

- **Wrong file is the classic mistake.** `/figma-component-coverage` and `/primitive-figma-sync` name the **product** file `kRTCdsBg4WpiGxQQGfvoLU`. Marketing components go in `oanAjqh5ei2L5BDURxnEi4`, page `12:8`. Never land a Broadsheet component in the product file.
- **Raw values, not tokens.** The existing marketing sets use raw hex + raw geometry (and `radius/md` token = 2px ≠ code's 6px). Match the raw values above so the new set is consistent with its neighbors.
- **Focus is raw `#2563eb`**, not the `a11y/focus-ring` variable (which aliases forest green).
- A skill can't fire on its own; the `broadsheet-figma-sync-reminder.mjs` PostToolUse hook nudges after **any** Broadsheet source edit that can move the visible surface — a component `.tsx`, its `.module.css` (the case that once let the Badge resize drift), the `broadsheet.css` foundation tokens (one `--sinamk-*` edit can shift every component), or `registry.tsx` (a control-axis change). It is **code → Figma only** — Figma edits raise no local file event, so run this manually after a Figma change.
