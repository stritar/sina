---
name: new-doc-page
description: Add or change a prose docs page in apps/web without regrowing the bloat — check the page/word budgets first, never retell a canonical story, keep meta.json and redirects consistent. Use when asked to "add a docs page", "document X", "expand the docs", or when the docs-budget/docs-canon/docs-links guard tests fail.
---

> Hardened on the 2026-07 docs consolidation (78 pages → ~18 prose pages + the
> primitives gallery). These budgets are the reason the docs stayed small.

## The trap

Docs bloat regrows one "just one more page" at a time, and each new page tends
to re-explain the gate ("the model proposes, the server decides…") before
getting to its point. The guards make both failure modes a build failure
instead of a review argument.

## Rules

1. **Budgets are caps, not targets** — ≤ 20 prose pages (outside `primitives/`),
   ≤ 700 prose words per page (`apps/web/content/docs-budget.test.ts`). A new
   page usually means merging or deleting another. If a page legitimately needs
   more, declare `wordBudget: <n>` in its frontmatter — visible and reviewable.
2. **One story, told once** — the canonical assets (`FlowDiagram`,
   `ArchitectureDiagram`, `EnforcementLadder`, `TokenTree`, `GovernanceDemo`)
   each have exactly one home, listed in the `CANON` table of
   `apps/web/content/docs-canon.test.ts`. Other pages **link**
   (`/docs/how-it-works`, `/docs/governance/wire-transfer`), never retell.
3. **No dead ends** — every internal `/docs/...` link must resolve, and a
   removed/moved page gets a flat 301 in `apps/web/redirects.mjs` (imported by
   `next.config.mjs` `redirects()`). **Never use `public/_redirects`** — the
   next-on-pages worker handles every path and Cloudflare skips `_redirects`
   for worker requests, so those rules silently 404 in production (this bit
   Phase 8.5). Redirects don't chain — point at the final URL. Guard:
   `apps/web/content/docs-links.test.ts`.

## Recipe

1. Ask first: does this content belong on an existing page? Prefer a section
   over a page. If adding, decide what merges or dies.
2. Write the `.mdx` under `apps/web/content/docs/<section>/` — frontmatter
   `title` + one-sentence `description`; compose from the visuals kit
   (`apps/web/app/components/docs/visuals/`); define jargon on first use with
   `<Term term="...">` where a plain-language tooltip helps.
3. Register the page in that folder's `meta.json` (order = sidebar + pager
   order).
4. If a page moved or died: add the flat 301 to `apps/web/redirects.mjs` and
   update inbound links (`grep -rn "old-slug" apps/web/content apps/web/app`).
5. Verify: `pnpm --filter web test` (budget, canon, links guards + axe) and
   `pnpm --filter web build` (run from `apps/web`, sandbox off). The llms
   raw-markdown files regenerate automatically (`scripts/generate-llms.mjs`
   walks the tree in `prebuild`).

## Reuses

- The visuals kit + `Term` — `apps/web/app/components/docs/visuals/index.ts`
- Guards — `apps/web/content/docs-{budget,canon,links}.test.ts`
- Redirects — `apps/web/redirects.mjs` (→ `next.config.mjs` `redirects()`)
- The CLAUDE.md "Docs stay small" rule

## Scaffolds

- `apps/web/content/docs/<section>/<page>.mdx`
