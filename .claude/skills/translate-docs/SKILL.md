---
name: translate-docs
description: Translate a new or changed docs page into the five supported locales (es/zh/fr/de/ja) as `<page>.<locale>.mdx` siblings, preserving imports/JSX/links, stamping a fresh `sourceHash`. Use when a page under content/docs is added or edited, when asked to "translate the docs", "update the translations", "add a language", or when the docs-i18n guard test fails.
---

> Seeded with Phase 8.6 (docs i18n). English is the single source of truth; the
> five locales (Spanish, Chinese, French, German, Japanese) are generated
> siblings, guarded for completeness + freshness + structural parity.

## The trap

A model translating an MDX page will happily "translate" an `import` line, a
component name, an `href`, or the inside of a code fence, and drop a page's
`<GovernanceDemo>` while rewriting the prose around it. Any of those breaks the
build (the demo stops rendering, a link 404s) or silently diverges the
translation from its source. The `docs-i18n` guard turns each of those into a
failing test instead of a review argument, but the skill is how you avoid them
in the first place.

## Rules

1. **English is the source; translations are `<page>.<locale>.mdx` siblings.**
   For `content/docs/<path>.mdx`, write `content/docs/<path>.es.mdx`,
   `.zh.mdx`, `.fr.mdx`, `.de.mdx`, `.ja.mdx`. Locales + native names live in
   `apps/web/lib/i18n/locales.ts` (`TRANSLATED_LOCALE_CODES`).
2. **Translate prose only.** Frontmatter `title` + `description`, body prose,
   and prose-bearing JSX text (element children, `<Callout>`/`<Card>` `title`
   attrs, `PropsTable` `description`, `<Term>` visible text). **Never** touch:
   `import` lines, component names, non-prose attributes (`term=`, `href=`,
   `variant=`, `slug=`, `code=`, `eyebrow` stays but IS prose), code fences,
   inline code, or `/docs/...` link targets. The `docs-i18n` guard fails if the
   translation's import lines or JSX component tag counts differ from the source.
3. **Use the glossary.** `apps/web/lib/i18n/glossary.ts` fixes the rendering of
   load-bearing terms (intent, governance, escalation, constitution,
   validate-then-mount, primitive) per locale and lists terms to keep in English
   (`SINA`, package names, code identifiers). Follow it so 250 files stay
   consistent.
4. **Stamp `sourceHash`.** Each translation's frontmatter carries
   `sourceHash: <hash>` = the English source fingerprint from
   `apps/web/content/i18n-hash.mjs` (`sourceHash(englishFileContents)`, first 12
   hex of sha256). The guard recomputes it and fails if English drifted.
5. **Em-dashes are fine in translations** (they are outside `docs-prose`), and
   word budgets do not apply (translations are outside `walkDocs()`). Do not add
   or translate the machine-translation notice; `DocsArticle` renders it from the
   chrome catalog on every non-English page.
6. **Translate the section titles too.** If the page changes a `meta.json`
   `title`, mirror it into `meta.<locale>.json` beside it (same `pages` order).
7. **Shrink the pending list.** Once a page has all five fresh siblings, remove
   it from `PENDING_TRANSLATION` in `apps/web/content/docs-i18n.test.ts`. When
   that list is empty every page is fully enforced.

## Recipe

1. Compute the English fingerprint:
   `node -e "import('./apps/web/content/i18n-hash.mjs').then(m=>process.stdout.write(m.sourceHash(require('fs').readFileSync(process.argv[1],'utf8'))))" apps/web/content/docs/<path>.mdx`
2. For each of `es`, `zh`, `fr`, `de`, `ja`: copy the English file, translate per
   Rules 2–4, set the frontmatter `sourceHash`, keep every import/JSX/link
   identical. Reference `content/docs/index.<locale>.mdx` for a worked example.
3. If a nav `title` changed, update the matching `meta.<locale>.json`.
4. Remove the page from `PENDING_TRANSLATION` in `docs-i18n.test.ts`.
5. Verify: `pnpm --filter web test -- docs-i18n` (the acceptance test:
   completeness + freshness + structural parity), then
   `pnpm --filter web test -- docs-prose docs-budget` (unchanged — English only),
   then `pnpm --filter web build` (cwd `apps/web`, sandbox off). Spot-check the
   translated route renders (`/es/docs/<path>`) with working demos and CJK glyphs.

## Reuses

- Locale config + native names — `apps/web/lib/i18n/locales.ts`
- Terminology contract — `apps/web/lib/i18n/glossary.ts`
- Fingerprint — `apps/web/content/i18n-hash.mjs` (shared with the guard)
- Guard (acceptance test) — `apps/web/content/docs-i18n.test.ts`
- Worked example — `content/docs/index.{es,zh,fr,de,ja}.mdx`
- Chrome strings (already localized, not per page) — `apps/web/lib/i18n/messages/`
- The CLAUDE.md "Every docs change is translated" rule; pairs with `/new-doc-page`
  and `/human-prose` (English side).

## Scaffolds

- `apps/web/content/docs/<path>.<locale>.mdx` (one per translated locale)
- `apps/web/content/docs/<section>/meta.<locale>.json` (when a nav title changes)
