import { readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

/** Shared helpers for the docs guard tests (canon, budget, links, primitives). */

export const CONTENT_ROOT = join(dirname(fileURLToPath(import.meta.url)), "docs");

/** Every .mdx file under content/docs, as absolute paths. */
export function walkDocs(dir: string = CONTENT_ROOT): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walkDocs(full));
    else if (entry.name.endsWith(".mdx")) files.push(full);
  }
  return files;
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
