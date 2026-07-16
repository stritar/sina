import { readdirSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

/** Shared helpers for the docs guard tests (canon, budget, links, primitives, i18n). */

export const CONTENT_ROOT = join(dirname(fileURLToPath(import.meta.url)), "docs");

/** The five translated locales (English is the un-suffixed source). */
export const TRANSLATED_LOCALES = ["es", "zh", "fr", "de", "ja"] as const;

/** A `<page>.<locale>.mdx` translation sibling (not an English source page). */
const LOCALE_SIBLING = new RegExp(`\\.(${TRANSLATED_LOCALES.join("|")})\\.mdx$`);

/** True for a translated sibling like `index.es.mdx`. */
export function isTranslation(file: string): boolean {
  return LOCALE_SIBLING.test(file);
}

/**
 * Every ENGLISH source `.mdx` under content/docs, as absolute paths. Translated
 * siblings (`<page>.<locale>.mdx`) are excluded, so the budget/canon/prose/
 * primitive guards keep measuring only the English source of truth.
 */
export function walkDocs(dir: string = CONTENT_ROOT): string[] {
  return walkAllDocs(dir).filter((file) => !isTranslation(file));
}

/** Every `.mdx` under content/docs, English sources AND translated siblings. */
export function walkAllDocs(dir: string = CONTENT_ROOT): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walkAllDocs(full));
    else if (entry.name.endsWith(".mdx")) files.push(full);
  }
  return files;
}

/** The translated-sibling path for an English source + locale (may not exist). */
export function translationPath(englishFile: string, locale: string): string {
  return englishFile.replace(/\.mdx$/, `.${locale}.mdx`);
}

/** The locale of a translated sibling (`index.es.mdx` -> `es`), else `null`. */
export function localeOfFile(file: string): string | null {
  const match = LOCALE_SIBLING.exec(basename(file));
  return match ? match[1]! : null;
}

/** The English source path for a translated sibling (`index.es.mdx` -> `index.mdx`). */
export function englishSourceOf(translationFile: string): string {
  return translationFile.replace(LOCALE_SIBLING, ".mdx");
}

/** Frontmatter of an .mdx source as a raw string ("" if none). */
export function frontmatter(source: string): string {
  const match = /^---\n([\s\S]*?)\n---/.exec(source);
  return match?.[1] ?? "";
}

/**
 * The reader-facing text of an .mdx source. Strips frontmatter, fenced code,
 * inline code spans, and import lines, and keeps everything else — including
 * JSX children and attribute strings, which are prose a reader sees (Callout
 * titles, PropsTable descriptions). Deliberately wider than `proseWordCount`,
 * which drops JSX lines because it only has to approximate a word budget.
 *
 * Stripped regions are blanked in place rather than removed, so line numbers
 * still line up with the file and a guard can report `path:line`.
 */
export function narrativeText(source: string): string {
  const blank = (match: string) => match.replace(/[^\n]/g, " ");
  return source
    .replace(/^---\n[\s\S]*?\n---/, blank)
    .replace(/```[\s\S]*?```/g, blank)
    .replace(/`[^`\n]*`/g, blank)
    .replace(/^import .*$/gm, blank);
}

/**
 * Count the PROSE words of an .mdx source. Strips frontmatter, fenced code
 * blocks, import lines, and markup-ish lines (JSX tags, prop rows, attribute
 * lines, quoted array items), so budgets measure what a reader actually reads.
 * Deliberately a line-based heuristic: budgets carry headroom and pages can
 * override with `wordBudget` frontmatter, so approximate is fine — predictable
 * beats precise here.
 */
export function proseWordCount(source: string): number {
  const body = source
    .replace(/^---\n[\s\S]*?\n---/, "")
    .replace(/```[\s\S]*?```/g, "");
  const kept = body.split("\n").filter((raw) => {
    const line = raw.trim();
    if (line === "") return false;
    if (line.startsWith("import ")) return false;
    // JSX / markup / data lines, not sentences:
    if (/^[<{}\]]/.test(line)) return false; // tags, prop-row objects, closers
    if (/^\/?>$/.test(line)) return false; // lone `>` / `/>`
    if (/^["'`]/.test(line)) return false; // quoted array items (DoDont rows…)
    if (/^[A-Za-z-]+=/.test(line)) return false; // attribute continuation lines
    return true;
  });
  const text = kept
    .join(" ")
    .replace(/<[^>]+>/g, " ") // inline tags like <Term …>
    .replace(/[`*_#|-]/g, " ");
  return text.split(/\s+/).filter(Boolean).length;
}
