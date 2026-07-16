import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { relative, join } from "node:path";
import {
  walkDocs,
  walkAllDocs,
  isTranslation,
  englishSourceOf,
  translationPath,
  CONTENT_ROOT,
  TRANSLATED_LOCALES,
  frontmatter,
} from "./docs-test-helpers";
import { sourceHash } from "./i18n-hash.mjs";

/**
 * Guard for the CLAUDE.md rule: every docs change is translated into the five
 * supported locales (es/zh/fr/de/ja).
 *
 * English is the single source of truth (the other guards measure it alone).
 * This guard covers the translated siblings, three ways:
 *
 *  1. Completeness — every English page (except those still in
 *     `PENDING_TRANSLATION`) has all five `<page>.<locale>.mdx` siblings.
 *  2. Freshness — each existing translation carries a `sourceHash` matching its
 *     English source, so an edited English page fails the build until its
 *     translations are regenerated (via /translate-docs).
 *  3. Structural parity — a translation imports the same modules and uses the
 *     same JSX components as its source; only prose + `title`/`description` differ.
 *
 * `PENDING_TRANSLATION` is a visible, shrinking opt-out list. When it is empty,
 * every page is fully enforced. /translate-docs removes a page from it once the
 * page is translated.
 */

const rel = (abs: string) => relative(CONTENT_ROOT, abs).replace(/\\/g, "/");

// English pages not yet translated. Shrink toward [] as translations land.
// All docs pages are now translated into every supported locale — the list is empty,
// so the completeness guard enforces all five siblings for every English page.
const PENDING_TRANSLATION: string[] = [];

const englishPages = walkDocs().map(rel);
const required = englishPages.filter((page) => !PENDING_TRANSLATION.includes(page));
const existingTranslations = walkAllDocs().filter(isTranslation).map(rel);

/** A page's structural signature: sorted import lines + JSX component tag counts. */
function structuralSignature(source: string): { imports: string[]; tags: Record<string, number> } {
  const body = source.replace(/^---\n[\s\S]*?\n---/, "");
  const imports = (body.match(/^import .*$/gm) ?? []).slice().sort();
  const tags: Record<string, number> = {};
  for (const match of body.matchAll(/<([A-Z][A-Za-z0-9]*)/g)) {
    const name = match[1]!;
    tags[name] = (tags[name] ?? 0) + 1;
  }
  return { imports, tags };
}

function frontmatterField(source: string, key: string): string | null {
  const match = new RegExp(`(?:^|\\n)${key}:\\s*(.+)`).exec(frontmatter(source));
  return match?.[1]?.trim() ?? null;
}

describe("docs i18n", () => {
  it("has English pages to check (guard is not vacuous)", () => {
    expect(englishPages.length).toBeGreaterThan(20);
  });

  it("PENDING_TRANSLATION lists only real English pages (no stale entries)", () => {
    for (const page of PENDING_TRANSLATION) {
      expect(englishPages, `stale PENDING_TRANSLATION entry: ${page}`).toContain(page);
    }
  });

  it.each(required)("%s has all five translations", (page) => {
    const english = join(CONTENT_ROOT, page);
    for (const locale of TRANSLATED_LOCALES) {
      const sibling = translationPath(english, locale);
      expect(
        existsSync(sibling),
        `missing ${locale} translation for ${page} — run /translate-docs`,
      ).toBe(true);
    }
  });

  // Every translation that DOES exist is checked, even for a still-pending page.
  it.each(existingTranslations)("%s is fresh (sourceHash matches its English source)", (page) => {
    const abs = join(CONTENT_ROOT, page);
    const englishAbs = englishSourceOf(abs);
    expect(existsSync(englishAbs), `orphan translation with no English source: ${page}`).toBe(true);

    const stored = frontmatterField(readFileSync(abs, "utf8"), "sourceHash");
    const actual = sourceHash(readFileSync(englishAbs, "utf8"));
    expect(
      stored,
      `${page}: sourceHash ${stored ?? "(missing)"} != ${actual} — English changed; re-run /translate-docs`,
    ).toBe(actual);
  });

  it.each(existingTranslations)("%s imports the same modules and uses the same components", (page) => {
    const abs = join(CONTENT_ROOT, page);
    const englishAbs = englishSourceOf(abs);
    if (!existsSync(englishAbs)) return; // reported by the freshness test

    const source = structuralSignature(readFileSync(englishAbs, "utf8"));
    const translation = structuralSignature(readFileSync(abs, "utf8"));
    expect(translation.imports, `${page}: import lines must not be translated`).toEqual(source.imports);
    expect(translation.tags, `${page}: JSX components must match the English source`).toEqual(source.tags);
  });
});
