---
name: new-web-section
description: Add a marketing/docs section to apps/web consuming theme tokens, following App Router layout conventions. Use when asked to "add a landing section", "new web page/section", or build marketing/docs content.
---

> **Best-guess seed — to be hardened on first real use (Phase 7).** Refine this recipe the first time you build a real web section.

Add a marketing or docs section to `apps/web` (the public site, port 3000). Tailwind is gone: it consumes `@sina-design-system/theme` `--sina-*` tokens via the stylesheets already imported in `apps/web/app/layout.tsx` (`@sina-design-system/theme/reset.css`, `.../theme/css`, `.../core/styles.css`), and authors section styling as **co-located CSS Modules**. It may show **read-only demos** of `core` — but carries **no governance logic**.

## Recipe

1. **Confirm the design hand-off** (layout + copy) is signed off (gate from `CLAUDE.md`).
2. **Add the section** under `apps/web/app/<route>/page.tsx` (or a component composed in an existing page), following App Router conventions and the existing `apps/web/app/{layout,page}.tsx`.
3. **Style via co-located CSS Modules** — add `<route>/page.module.css` (or a section `*.module.css`), `import styles from "./page.module.css"`, and apply `className={styles.x}` (see `apps/web/app/page.module.css`). Consume `--sina-*` tokens only (`var(--sina-color-*)`, `var(--sina-space--*)`, `var(--sina-text--*)`); **no `@tailwind` directives, no `tailwind.config`, no hard-coded design values**.
4. **Demos only** — if embedding `core`, render it read-only. No `fintech`/`defense` schemas or governance logic in `web`.
5. **Verify:** `pnpm --filter web lint typecheck build`; preview with `pnpm --filter web dev` on port 3000.

## Reuses

- `apps/web/app/layout.tsx` (imports the theme/core stylesheets) and `apps/web/app/page.tsx` + `page.module.css` (layout + CSS Modules conventions).
- The `--sina-*` tokens from `@sina-design-system/theme/css` (+ `reset.css`), imported once in `apps/web/app/layout.tsx`.

## Scaffolds

`apps/web/app/<route>/page.tsx` and any section-specific components.
