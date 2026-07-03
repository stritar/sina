---
name: primitive-figma-sync
description: Keep a core primitive and its SINA Figma component in lockstep — both directions. Use after editing a primitive in packages/core/** (variants, sizes, props, tokens, anatomy, a11y) to mirror the change into the Figma file, and after editing a Figma component to mirror it back into the code. Triggers: "sync to figma", "update figma to match the code", "update the code to match figma", "we changed <primitive>, update figma", or any primitive change that alters its visible prop surface.
---

> **The invariant:** the code in `packages/core` and its component on the SINA Figma file (`kRTCdsBg4WpiGxQQGfvoLU`, see [[sina-figma-file]]) are **one source of truth in two places**. A change to either side that alters the *visible prop surface* (variants, sizes, booleans, instance-swaps, text props, tokens, anatomy, interaction states) is not done until the other side matches. Internal-only refactors (renamed locals, comment edits, test changes, a `cn()` cleanup with no visual delta) do **not** trigger a sync.

Figma is **downstream of design sign-off but in lockstep with code** for primitives that are already built. This skill is the bridge; `figma-component-coverage` is the *acceptance test* both sides must pass after the sync.

## When this fires

- After an `Edit`/`Write` to `packages/core/src/<Name>/<Name>.tsx` that changes a `cva` variant/size, adds/removes/renames a prop, swaps a token, or changes anatomy/states → **sync code → Figma**.
- After a Figma edit (you or a designer changed a component's variants/props/tokens) → **sync Figma → code**.
- Decide direction by *who changed last*. If both changed, surface the conflict — do not silently overwrite; ask which side wins.

## The mapping (code dir ↔ Figma page ↔ master key)

The Figma file is one component-family per page under `——— COMPONENTS ———`. Probe pages by ID (`get_metadata`'s bare page list under-reports — do a read-only `use_figma` `figma.root.children` scan instead; see [[sina-figma-file]]). Master keys are on each set via `getSharedPluginData('dsb','key')`. **IDs below are the post-2026-06-29-rebuild IDs (verified 2026-07-03).**

| `packages/core/src/` | Figma page (id) | set key(s) |
|---|---|---|
| Button | Button `7:61` | `button` |
| Badge | Badge `7:62` | `badge` |
| Alert | Alert `7:63` | `alert` |
| TextField · CurrencyField · CredentialField · Field | Field & Inputs `7:64` | `textfield`, `currencyfield`, `credentialfield`, `otp` |
| Select · Combobox | Select & Combobox `7:65` | `select-trigger`, `combobox` |
| Checkbox · RadioGroup | Checkbox & Radio `7:66` | `checkbox`, `radio` |
| Dialog · Toast | Dialog & Toast `7:67` | `toast` (Dialog is a composed *scene* `36:2`, not a set) |
| Tooltip | Tooltip `7:68` | `tooltip` |
| Progress · Spinner | Progress & Spinner `7:69` | `progress`, `spinner` |
| SummaryList | SummaryList `7:70` | `summarylist` |
| **Chart** | **Chart `123:2`** | **`chart`** (variant set `123:21`; `Variant`=line/area/bar; States strip + Coverage) |
| Stack · Grid | Layout & Utilities `7:71` | — (layout primitives, doc-only) |
| Icon · ScrollArea · Separator · VisuallyHidden | Layout & Utilities `7:71` | — (utilities; glyphs incl. FileText `130:2`) |

> **Governed fintech scenes** (the `fintech-react` third layer — synced via `/new-governed-component`, *not* this skill) live one-per-page as composed *scenes*, not variant sets: SecureWireDialog `110:2`, **GovernedActionDialog `127:2`** (6-phase strip; scene `127:3`), **MandatoryDisclosure `132:2`** (4-phase strip; scene `132:3`). Ungoverned reads → **Fintech Displays `139:2`**; the composed experience hero → **Financial Dashboard `147:2`** (Light `147:3` + Dark `148:44`).

## Before any Figma write (mandatory)

Load `figma-use` guidance first — read `skill://figma/figma-use/SKILL.md` (and `references/component-patterns.md` for variants/props). Skipping it causes hard-to-debug failures. Batch-load the Figma tool schemas in one `ToolSearch` (`select:use_figma,get_screenshot,get_metadata,get_variable_defs`). Honour `CLAUDE.md` hard rules: **bind to existing variables/tokens, never raw hex or off-grid spacing** (see [[sina-strict-tailwind-grid]], [[border-color-double-prefix]]). Pin the component set to the Color collection's **Light** mode after edits.

## Direction A — code → Figma

1. **Diff the prop surface.** Read the changed `<Name>.tsx`; enumerate every `cva` variant axis + values, every prop in the `*Props` interface (boolean / enum / text / slot), and the tokens used. This is the authoritative list — Figma must match these names exactly (lowercase variant values: `primary`, `sm`, `ghost`, …).
2. **Locate the Figma component** by page (table above) + master key; dump `componentPropertyDefinitions` on the set. Compare to the code surface.
3. **Apply the delta only** — don't rebuild the page:
   - New/renamed **variant value** → add/rename the `COMPONENT` in the set (keep the grid readable, `combineAsVariants`).
   - New **boolean / instance-swap / text** prop → add it to one variant and let clones merge the key; wire `componentPropertyReferences` (`visible`→BOOLEAN, `mainComponent`→INSTANCE_SWAP, `characters`→TEXT). **Preserve existing bindings** — if you swap a node, re-point any boolean that referenced it (this is exactly how the Toast Undo → ghost-Button swap kept `Show Action#114:6`).
   - **Token / anatomy** change → rebind the variable (never hardcode) or adjust the auto-layout.
   - **Interaction state** change (hover/active/focus/disabled/loading) → update the **States strip**, NOT the variant matrix (states are runtime styling in v2; a Figma boolean can't drive color).
4. **Update the docs on the page** that name the changed surface — the set `description`, the *Variants & sizes* block, and *Engineering notes* (keep the JSX sketch + "Mirror `<Name>.tsx`" honest).
5. **Run `figma-component-coverage`** — every prop the code now exposes must be visibly demonstrated (matrix + coverage frame). That skill is the acceptance test; this one is the diff.

## Direction B — Figma → code

1. **Diff the Figma surface.** Dump `componentPropertyDefinitions` + variant options on the set; screenshot the variants, states strip, and coverage frame.
2. **Map back to code names.** Variant values are lowercase and map to `cva` variants; booleans/text/instance-swaps map to the `*Props` interface. Tokens map to theme class names (`bg-surface-raised`, `text-text-muted`, `size-control-xs`, …) — see `new-primitive` for the exact token vocabulary.
3. **Apply the delta to `<Name>.tsx`** within the hard boundary: `core` stays headless, Radix-based, token-styled, **no `zod` / domain packages / domain vocabulary** (`CLAUDE.md`). New visual states use Tailwind state variants, not new component variants.
4. **Mirror the playground story** (`apps/playground/app/primitives/<name>/page.tsx`) so the new prop/variant is exercised, and update the co-located test if a prop/role/label changed.
5. **Verify** (below).

## Verification (mandatory, both directions)

- **Names agree:** the `cva`/`*Props` surface in code === the set's `componentPropertyDefinitions` (values lowercase, 1:1).
- **Figma:** `get_screenshot` the set + coverage frame — every variant cell renders (no blank/black), every non-variant prop is demonstrated, bindings still toggle (test the booleans). Set pinned to Light mode.
- **Code:** `pnpm --filter @sina-design-system/core lint typecheck test` and `pnpm --filter @sina-design-system/core build`; if the story or a prerendered surface changed, `pnpm --filter playground build` (RSC export/render bugs only surface at prerender).
- **A11y unchanged or improved** — the four-part bar still holds (focus-trap + ARIA + keyboard + axe).

## Making it automatic (optional)

A skill is invoked by the agent; it does not fire on its own. To make the sync *prompt itself* on every primitive edit, add a `PostToolUse` (or `Stop`) **hook** in `.claude/settings.json` that, when an `Edit`/`Write` touched `packages/core/src/**/*.tsx`, emits a reminder to run `/primitive-figma-sync`. Hooks are executed by the harness, not the model — use the `update-config` skill to wire one. Until then, invoke this skill yourself after a primitive change (either side).

## Reuses / reference

- `figma-component-coverage` (the acceptance test — show all props) and `new-primitive` (token vocabulary + RSC export rules + boundary).
- `figma-use` skill (Plugin API rules) + `references/component-patterns.md` (`combineAsVariants`, `addComponentProperty`, `componentPropertyReferences`).
- Memory: [[sina-figma-file]] (keys, page IDs, v2 conventions), [[sina-figma-use-gotchas]], [[sina-strict-tailwind-grid]], [[border-color-double-prefix]], [[twmerge-custom-token-collisions]].
