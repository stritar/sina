---
name: broadsheet-label-anatomy
description: Give every Broadsheet control that pairs an icon with a text label the SAME internal anatomy — no flex gap; the label carries its own padding — in both code and Figma. Use when building or editing an icon+label control under apps/web/app/(marketing)/broadsheet/ (button, badge, chip, tag, pill, segment item), when asked to "match the badge to the buttons", "give the label its own padding", "remove the gap between icon and label", "same structure as the buttons", or when recreating such a component in the SINA-marketing Figma file.
---

> **The invariant:** every Broadsheet control that lays an **icon slot next to a text label** shares one anatomy so the family reads as one system. The spacing between the icon and the label comes from the **label's own padding**, never from a flex `gap` / auto-layout `itemSpacing`. The label is its own padded box; the icon slots are unpadded; the root carries the control's outer padding. This holds in **both** the code CSS module and the Figma component. The reference is `ButtonSecondary`/`ButtonPrimary` (code) and the `Button / *` + `Badge` sets in the SINA-marketing Figma file.

## When this fires

- Building or editing any icon+label control under `apps/web/app/(marketing)/broadsheet/` — button, badge, chip, tag, pill, segment item, or anything with a leading/trailing icon beside text.
- "Make `<X>` match the buttons", "the label needs its own padding", "there shouldn't be a gap", "same structure as the buttons".
- Recreating such a control in Figma via `/marketing-figma-sync` — the Figma anatomy must mirror the code anatomy.
- NOT for `packages/core` primitives (those are their own system) and NOT for spacing **between** separate controls in a group (see the exception in Gotchas).

## The anatomy — code (`<Name>.module.css`)

Mirror `ButtonPrimary.module.css`. Three parts, **no `gap` on the root**:

```css
.root {
  display: inline-flex;
  align-items: center;
  padding-inline: var(--sinamk-control-pad--md, 8px);  /* outer pad, per size below */
  /* NO gap / column-gap — spacing comes from the label */
}
.slot {                 /* icon box — unpadded, fixed */
  display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.slot svg { display: block; width: var(--_icon); height: var(--_icon); }
.label {                /* the label owns its horizontal padding */
  display: inline-flex; align-items: center;
  padding-inline: var(--_labelpad);
}
```

Each per-size block sets the outer pad, the label pad, the icon size, and the type ramp — **the one place the size scale lives**:

```css
.root[data-size="sm"] { padding-inline: var(--sinamk-control-pad--sm, 6px);  --_labelpad: var(--sinamk-label-pad--sm, 4px); --_icon: var(--sinamk-icon--sm, 14px); font-size: var(--sinamk-text--sm, 12px); font-weight: var(--sinamk-font-weight--sm, 400); }
.root[data-size="md"] { padding-inline: var(--sinamk-control-pad--md, 8px);  --_labelpad: var(--sinamk-label-pad--md, 6px); --_icon: var(--sinamk-icon--md, 16px); font-size: var(--sinamk-text--md, 13px); font-weight: var(--sinamk-font-weight--md, 500); }
.root[data-size="lg"] { padding-inline: var(--sinamk-control-pad--lg, 12px); --_labelpad: var(--sinamk-label-pad--lg, 8px); --_icon: var(--sinamk-icon--lg, 20px); font-size: var(--sinamk-text--lg, 15px); font-weight: var(--sinamk-font-weight--lg, 600); }
```

Net inline spacing with a leading icon: `[control-pad][icon][label-pad · text · label-pad][control-pad]`. The gap you see between icon and text is the label's left padding — not a `gap`. The TSX wraps each in a span: `<span className={styles.slot}>{icon}</span>` then `<span className={styles.label}>{children}</span>` (see `ButtonPrimary.tsx`).

## The anatomy — Figma (SINA-marketing)

Mirror the `Button / *` and `Badge` sets. Same three parts:

- **Root** COMPONENT: `layoutMode: HORIZONTAL`, `itemSpacing: 0`, `primaryAxisAlignItems: MIN`, `counterAxisAlignItems: CENTER`. Height comes from **vertical padding**, not a fixed size: `paddingLeft/Right` = control-pad, `paddingTop/Bottom` = `(control-height − icon) / 2`, then HUG both axes.
- **Icon** (`icon` / `iconLeft` / `iconRight`): an instance or vector, no padding.
- **Label**: a **FRAME** named `label` — `layoutMode: HORIZONTAL`, `counterAxisAlignItems: CENTER`, `paddingLeft/Right` = label-pad, `paddingTop/Bottom: 0`, `itemSpacing: 0` — containing a single `text` node. The icon→label spacing is this frame's left padding; the root has **no** `itemSpacing`.

The size scale in raw values (matches the code tokens): control-pad **6 / 8 / 12**, label-pad **4 / 6 / 8**, icon **14 / 16 / 20**, text **12 / 13 / 15** at Rubik **Regular / Medium / SemiBold**, height **28 / 32 / 40** (so padTB **7 / 8 / 10**).

## Recipe

1. **Structure the label as a padded box.** In code, the `.label` span gets `padding-inline: var(--_labelpad)`; in Figma, the label is a FRAME with `paddingLeft/Right` = label-pad.
2. **Zero the gap.** No `gap`/`column-gap` on the code root; `itemSpacing: 0` on the Figma root. Delete any gap you find between an icon slot and a label.
3. **Outer pad on the root**, per size (`--sinamk-control-pad--*`).
4. **Keep icon slots unpadded** and fixed to `--_icon` per size.
5. **Drive everything from the per-size block** — one place sets control-pad, label-pad, icon size, and the type ramp.
6. **Sync both sides.** A change here is a prop-surface/anatomy change, so mirror code↔Figma with `/marketing-figma-sync`.

## Reference

- `apps/web/app/(marketing)/broadsheet/ButtonPrimary.module.css` + `ButtonPrimary.tsx` — the canonical code anatomy.
- `apps/web/app/(marketing)/broadsheet/Badge.module.css` — the same anatomy on a pill.
- SINA-marketing Figma: `Button / Secondary` and `Badge` (`91:544`) — the Figma anatomy (label FRAME with padding, root `itemSpacing: 0`). See [[marketing-design-system-figma]].

## Gotchas

- **A `gap` between separate controls is fine — this rule is about *within* one control.** `SegmentSelector.module.css` uses `gap: 2px` on its group root to space the *segments* apart; each segment still spaces its own icon↔label with the label's padding. The ban is on gap for **icon↔label** spacing, not on gap between sibling items in a group (a badge row, a segment strip).
- **Text nodes can't hold padding in Figma** — that is why the label is a FRAME wrapper, not a bare text node. A bare text label + root `itemSpacing` is the anti-pattern this skill exists to correct (the Badge's first build shipped it, then was rebuilt).
- **No automated guard** backs this (a plain `gap` regex would false-positive on legitimate group gaps like SegmentSelector's). It is a convention enforced by this skill, code review, and Figma coverage — hold it deliberately.
- Pairs with `/broadsheet-foundations` (the values are all `--sinamk-*` tokens), `/marketing-focus-outline`, `/new-marketing-component` (scaffolder), and `/marketing-figma-sync` (mirror the anatomy into Figma).
