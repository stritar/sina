import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { relative } from "node:path";
import { walkDocs, frontmatter, proseWordCount, CONTENT_ROOT } from "./docs-test-helpers";

/**
 * Guard for the CLAUDE.md rule: docs page and word budgets.
 *
 * The docs stay small by construction: prose pages are capped in number and in
 * words, so adding a page (or letting one bloat) fails the build instead of
 * slipping through review. A page that legitimately needs more room declares
 * `wordBudget: <n>` in its frontmatter — a visible, reviewable number, not a
 * silent opt-out. Recipe: /new-doc-page.
 */
const PROSE_WORD_BUDGET = 700; // per prose page (targets are 300–550; headroom included)
const PRIMITIVE_WORD_BUDGET = 300; // per primitives page (target ≤250)
const MAX_PROSE_PAGES = 20; // pages outside primitives/
const MAX_TOTAL_PROSE_WORDS = 9000; // backstop across all prose pages

const pages = walkDocs().map((file) => {
  const rel = relative(CONTENT_ROOT, file);
  const source = readFileSync(file, "utf8");
  return { rel, source, words: proseWordCount(source) };
});

const isPrimitive = (rel: string) => rel.startsWith("primitives/");
const prosePages = pages.filter((p) => !isPrimitive(p.rel));

function budgetFor(page: { rel: string; source: string }): number {
  const override = /(?:^|\n)wordBudget:\s*(\d+)/.exec(frontmatter(page.source));
  if (override) return Number(override[1]);
  return isPrimitive(page.rel) ? PRIMITIVE_WORD_BUDGET : PROSE_WORD_BUDGET;
}

describe("docs budgets", () => {
  it("has pages to check (guard is not vacuous)", () => {
    expect(pages.length).toBeGreaterThan(20);
  });

  it(`keeps the prose docs at ≤ ${MAX_PROSE_PAGES} pages`, () => {
    // On failure the page list prints — merge into an existing page before adding.
    expect(prosePages.map((p) => p.rel).sort().length).toBeLessThanOrEqual(MAX_PROSE_PAGES);
  });

  it(`keeps the total prose corpus under ${MAX_TOTAL_PROSE_WORDS} words`, () => {
    const total = prosePages.reduce((sum, p) => sum + p.words, 0);
    expect(total).toBeLessThanOrEqual(MAX_TOTAL_PROSE_WORDS);
  });

  it.each(pages)("$rel stays within its word budget", (page) => {
    expect(page.words).toBeLessThanOrEqual(budgetFor(page));
  });
});
