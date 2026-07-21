---
name: release-changelog
description: Update the docs changelog page (apps/web/content/docs/reference/changelog.mdx) when a new version is published — bump the "Current versions" line + install snippet, add a terse ## X.Y.Z section sourced from the per-package CHANGELOG.md, and re-translate the five locales. Use when asked to "update the changelog", "we released a new version", "bump the changelog", "document the release", or when the docs-changelog guard test fails.
---

> Seeded 2026-07 after the docs changelog silently fell a release behind: it read
> 0.1.0 while the packages had already shipped 0.2.0. The guard turns that drift
> into a build failure; this skill is the routine that keeps it current.

## The trap

Changesets does the version bump for you: `changeset version` rewrites every
`package.json` and appends to each per-package `CHANGELOG.md` inside the Version
PR. What it does NOT touch is the hand-written narrative page at
`apps/web/content/docs/reference/changelog.mdx` ("Releases & stability"). So the
docs quietly lag: the packages ship 0.2.0 while the page still says 0.1.0, still
tells readers to `pnpm add …@0.1.0`, and has no 0.2.0 entry. Nobody notices until
someone reads the docs.

## Rules

1. **Name the current version in three places** — the "Current versions" summary
   line (`published at **X.Y.Z**`), the `pnpm add …@X.Y.Z` install snippet, and a
   `## X.Y.Z: <name>` release section. The current version is whatever the five
   public packages report; they move in lockstep (Changesets `fixed`), so read it
   from any one (`packages/core/package.json`). Guard:
   `apps/web/content/docs-changelog.test.ts`.
2. **Source each entry from the generated CHANGELOG** — the human summary is a
   plain-language digest of that release's `packages/*/CHANGELOG.md` (the file
   `changeset version` wrote). Do not invent scope, and do not paste the raw
   changeset. Newest section on top, above the previous one.
3. **Prose reads human** — no em-dash/en-dash in the entry you write; the page is
   under `content/docs`, so follow `/human-prose` (guard:
   `apps/web/content/docs-prose.test.ts`).
4. **Re-translate the five locales** — editing the English source changes its
   `sourceHash`, so the five `changelog.<locale>.mdx` siblings go stale. Run
   `/translate-docs` to regenerate them (guard:
   `apps/web/content/docs-i18n.test.ts`).
5. **Stay under budget** — the page shares the 700-word prose cap
   (`apps/web/content/docs-budget.test.ts`). Keep each entry to a few terse
   sentences. When the page nears the cap, either declare a visible
   `wordBudget: <n>` override or condense the oldest entries and point them at the
   per-package `CHANGELOG.md`.

## Recipe

1. Read the just-published version:
   `node -p "require('./packages/core/package.json').version"`.
2. In `apps/web/content/docs/reference/changelog.mdx`: bump the summary line and
   the `pnpm add` snippet to `X.Y.Z`, and add a `## X.Y.Z: <name>` section at the
   top of the history (above the previous release), digesting that release's
   `packages/*/CHANGELOG.md` in human prose.
3. Re-translate: run `/translate-docs` for `reference/changelog.mdx` so all five
   siblings get the new `sourceHash` and the translated section.
4. Verify: `pnpm --filter web test` (the `docs-changelog` version guard +
   `docs-i18n` freshness + `docs-prose` + `docs-budget`), then
   `pnpm --filter web build` (cwd `apps/web`, sandbox off).

## Reuses

- The version, in lockstep — `packages/core/package.json` (Changesets `fixed` in
  `.changeset/config.json`)
- The generated source — `packages/*/CHANGELOG.md` (written by `changeset version`)
- Guards — `apps/web/content/docs-changelog.test.ts` +
  `docs-{i18n,prose,budget}.test.ts`
- Translation — `/translate-docs`; human prose — `/human-prose`
- The CLAUDE.md "Every release updates the changelog page" rule
