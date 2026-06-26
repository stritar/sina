---
name: new-web-section
description: Add a marketing/docs section to apps/web consuming theme tokens, following App Router layout conventions. Use when asked to "add a landing section", "new web page/section", or build marketing/docs content.
---

> **Best-guess seed — to be hardened on first real use (Phase 7).** Refine this recipe the first time you build a real web section.

Add a marketing or docs section to `apps/web` (the public site, port 3000). It consumes `@sina-design-system/theme` (Tailwind preset already wired in `apps/web/tailwind.config.ts`) and may show **read-only demos** of `core` — but carries **no governance logic**.

## Recipe

1. **Confirm the design hand-off** (layout + copy) is signed off (gate from `CLAUDE.md`).
2. **Add the section** under `apps/web/app/<route>/page.tsx` (or a component composed in an existing page), following App Router conventions and the existing `apps/web/app/{layout,page}.tsx`.
3. **Style via theme** — use the Tailwind preset tokens/classes; no hard-coded design values.
4. **Demos only** — if embedding `core`, render it read-only. No `fintech`/`defense` schemas or governance logic in `web`.
5. **Verify:** `pnpm --filter web lint typecheck build`; preview with `pnpm --filter web dev` on port 3000.

## Reuses

- `apps/web/app/layout.tsx` and `apps/web/app/page.tsx` (layout conventions).
- The theme Tailwind preset, already wired via `presets: [require("@sina-design-system/theme/tailwind")]`.

## Scaffolds

`apps/web/app/<route>/page.tsx` and any section-specific components.
