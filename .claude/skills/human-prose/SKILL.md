---
name: human-prose
description: Write (or repair) reader-facing docs prose so it doesn't read as machine-written — no em-dashes, ordinary punctuation, varied sentence length. Use when asked to "remove the dashes", "it sounds like AI wrote it", "make it sound human", when writing or editing ANY page under apps/web/content/docs or the marketing copy, or when the docs-prose guard test fails.
---

> Hardened on the 2026-07 de-AI pass: the docs carried 191 em-dashes in 12k
> words (one per 45 prose words), which was the single loudest tell that a model
> had written them. The vocabulary was already clean; the punctuation wasn't.

## The trap

A model reaches for the em-dash by default, and it reaches for the *same* two
constructions every time:

- **The appositive gloss** — `X — a thing that is Y — verb…`
- **The corrective pivot** — `it isn't A — it's B.`

One of these per paragraph is what makes a page feel generated even when every
sentence is true and the word choice is plain. It is a punctuation and rhythm
problem, not a vocabulary problem, so a buzzword blocklist won't catch it.

## Rules

1. **No em-dash (`—`) or en-dash (`–`) in reader-facing prose.** Scope is every
   `.mdx` under `apps/web/content/docs` (including JSX children, `<Callout>`
   titles, and `PropsTable` `description` strings — a reader sees those) plus
   `apps/web/app/(marketing)/page.tsx`. Guard:
   `apps/web/content/docs-prose.test.ts`. Code fences, inline code, and
   frontmatter are exempt; a `→` arrow is not a dash and is fine.
2. **Repo files are out of scope.** `CLAUDE.md`, `ROADMAP.md`, `README.md`, and
   code comments are internal and may use whatever punctuation reads best. The
   rule governs what ships to a reader.
3. **Meaning is frozen.** Repunctuating is not a licence to change a technical
   claim, a number, a citation, or a link. If a rewrite would alter what a
   sentence asserts, keep the sentence and fix only the punctuation.
4. **Stay inside the word budget.** `docs-budget.test.ts` caps prose at 700
   words a page (300 for a primitive page) and 9,000 in total, and the docs run
   close to that ceiling. Splitting an aside into two sentences *adds* words, so
   prefer the moves that shorten.

## The five moves

Reach for these in order; they cover essentially every dash you'll meet.

| Construction | Before | After |
|---|---|---|
| Appositive gloss | `a named value — a color, a spacing step — that…` | a colon, or parentheses: `a named value: a color, a spacing step` |
| Corrective pivot | `The request isn't refused — it's redirected.` | assert the positive: `The request is redirected, not refused.` |
| Bold-term list gloss | `- **\`valid\`** — \`true\` only when nothing blocks.` | a colon: `- **\`valid\`**: \`true\` only when nothing blocks.` |
| Trailing aside | `…emits a record — what was asked, what was decided.` | a comma, or a new short sentence |
| Bold heading + dash | `**Layer 1 — structure.**` | `**Layer 1: structure.**` |

Then read the paragraph aloud. Two more things carry the generated feel:

- **Uniform sentence length.** Every sentence landing at 15-25 words is its own
  tell. Let a short one land on its own.
- **Decorative bolding.** Bold a term you're defining, not a phrase you want to
  sound emphatic. `**bold** — gloss` is the same habit wearing a different hat.

Keep a rhetorical question that carries real structure ("Why your server, and
not the browser? Because…"). Collapse stacked runs of them.

## Recipe

1. Find the offenders: `pnpm --filter web test -- docs-prose`, or
   `grep -rn "—\|–" apps/web/content/docs`.
2. Apply the five moves. Do **not** blind-replace `—` with `,`; a page of comma
   splices reads exactly as machine-written as a page of dashes.
3. Re-check the word budget (the global cap has little headroom):
   `pnpm --filter web test -- docs-budget`.
4. Verify: `pnpm --filter web test` (prose, budget, canon, links, primitive
   guards) and `pnpm --filter web build` (run from `apps/web`, sandbox off) —
   the rewrite touches JSX children, so an unbalanced tag is the plausible break.

## Reuses

- Guard — `apps/web/content/docs-prose.test.ts`
- Text extraction — `narrativeText()` in `apps/web/content/docs-test-helpers.ts`
  (blanks frontmatter/code in place, so line numbers still match the file)
- The CLAUDE.md "Prose reads human" rule
- Pairs with `/new-doc-page` (prose pages) and `/new-primitive-doc` (primitive
  pages): both must also pass this rule.
