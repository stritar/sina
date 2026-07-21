---
name: new-primitive-doc
description: Add the shadcn-style docs page for a core primitive — live hero demo, Preview/Code examples, props table, gallery card — ported from its playground story. Use when a new primitive lands in @sina-design-system/core, when the primitive-docs guard test fails, or when asked to "document a primitive" / "add a component page to the docs".
---

> Hardened on the 2026-07 primitives-gallery build (28 primitives ported from
> playground stories to live docs demos).

## The pattern

Each primitive page is: live hero first, then usage code, then Preview/Code
examples, then the props table, then accessibility notes — ≤ 300 prose words.
The demo is a real client component importing the published primitive, imported
**directly by the MDX** (never registered in `mdx-components.tsx` — that would
pull every demo into every docs page; direct imports keep demos code-split
per page).

## Recipe

1. Port the playground story: `apps/playground/app/primitives/<slug>/page.tsx`
   has the `VARIANTS`/`SIZES`/`STATES` arrays and demo compositions. Create
   `apps/web/app/components/docs/demos/primitives/<slug>.tsx` (`"use client"`)
   exporting `<Name>Hero` and `<Name>Examples`, composed from the shell
   (`../shell`): `Hero`, `Example` (Preview/Code tabs — pass the source as a
   `code` template literal), `Demo`, `Specimen`, `Matrix`, and end with
   `<StorySource slug="<slug>" />`. No new CSS files; no inline styles (known
   exceptions: ScrollArea height, chart dimensions). **Never name a demo module
   `icon.tsx`** — any `icon.tsx` under `app/**` triggers Next's icon
   metadata-route convention and breaks the build (the Icon demo is
   `icon-demo.tsx`).
2. Write `apps/web/content/docs/primitives/<slug>.mdx` from the template
   (mirror `button.mdx`): frontmatter → demo import via
   `@/app/components/docs/demos/primitives/<slug>` → `<Name>Hero />` → 1–2
   sentence intro → `## Usage` (tsx fence) → `## Examples` + `<Name>Examples />`
   → `## Props` (`<PropsTable>`) → optional `## Do & don't` → `## Accessibility`.
   The intro, the `## Accessibility` note, **and the `PropsTable` `description`
   strings** are reader-facing prose: no em-dashes, per `/human-prose`.
3. **Props rows live in a data module, never inline in the MDX.** Create
   `apps/web/app/components/docs/props/<slug>.props.mjs` (mirror
   `badge.props.mjs`): a `PropDoc` with the English `props` rows plus
   `i18n.{es,zh,fr,de,ja}` description maps (keys = prop names), and a
   `<camel>PropRows(locale)` helper via `rowsFor`. The English page imports it
   and renders `<PropsTable rows={<camel>PropRows()} />`; each locale sibling
   uses the **byte-identical import line** and passes its locale
   (`<camel>PropRows("es")`). This module is also what `generate-dsds.mjs`
   reads for the primitive's DSDS `api` block — one source, no drift. The
   `dsds.test.ts` guard fails on inline rows, missing locale keys, or a dash
   in an English description.
4. Add the slug to `primitives/meta.json` and a card (with a tiny inert
   specimen) to the gallery
   (`apps/web/app/components/docs/demos/primitives/gallery.tsx`).
5. If the export is a subcomponent documented on its parent's page (e.g.
   `DialogTrigger`), add it to `EXCLUDE` in
   `apps/web/content/core-slugs.ts` (shared by the `primitive-docs` and
   `dsds` guards) instead.
6. Verify: `pnpm --filter web test` — `primitive-docs.test.ts` and
   `dsds.test.ts` are the acceptance tests — then `pnpm --filter web build`
   (cwd `apps/web`, sandbox off). If the demo shows a stale primitive, rebuild
   core first (`/preview-change`).

## Reuses

- The demo shell — `apps/web/app/components/docs/demos/shell.tsx`
- The playground stories — `apps/playground/app/primitives/<slug>/page.tsx`
  (demos are **copied**, not shared — when a primitive's prop surface changes,
  update both; `/primitive-figma-sync` covers the Figma side)
- Guards — `apps/web/content/primitive-docs.test.ts` +
  `apps/web/content/dsds.test.ts` (slug universe shared via
  `apps/web/content/core-slugs.ts`)
- Props module helper — `apps/web/app/components/docs/props/prop-docs.mjs`
  (`rowsFor`; reference implementation `badge.props.mjs`)
- Reference implementation — `button.tsx` + `button.mdx`

## Scaffolds

- `apps/web/app/components/docs/demos/primitives/<slug>.tsx`
- `apps/web/app/components/docs/props/<slug>.props.mjs`
- `apps/web/content/docs/primitives/<slug>.mdx`
