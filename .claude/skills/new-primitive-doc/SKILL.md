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
3. Add the slug to `primitives/meta.json` and a card (with a tiny inert
   specimen) to the gallery
   (`apps/web/app/components/docs/demos/primitives/gallery.tsx`).
4. If the export is a subcomponent documented on its parent's page (e.g.
   `DialogTrigger`), add it to `EXCLUDE` in
   `apps/web/content/primitive-docs.test.ts` instead.
5. Verify: `pnpm --filter web test` — `primitive-docs.test.ts` is the
   acceptance test — then `pnpm --filter web build` (cwd `apps/web`, sandbox
   off). If the demo shows a stale primitive, rebuild core first
   (`/preview-change`).

## Reuses

- The demo shell — `apps/web/app/components/docs/demos/shell.tsx`
- The playground stories — `apps/playground/app/primitives/<slug>/page.tsx`
  (demos are **copied**, not shared — when a primitive's prop surface changes,
  update both; `/primitive-figma-sync` covers the Figma side)
- Guard — `apps/web/content/primitive-docs.test.ts`
- Reference implementation — `button.tsx` + `button.mdx`

## Scaffolds

- `apps/web/app/components/docs/demos/primitives/<slug>.tsx`
- `apps/web/content/docs/primitives/<slug>.mdx`
