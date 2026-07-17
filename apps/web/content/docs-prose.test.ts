import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { walkDocs, narrativeText, CONTENT_ROOT } from "./docs-test-helpers";

/**
 * Guard for the CLAUDE.md rule: "Prose reads human."
 *
 * An em-dash aside ("X — a thing that is Y — verb…") is the loudest tell that a
 * page was written by a model rather than a person, and at one per 45 words it
 * was the house style here. Reader-facing prose uses ordinary punctuation: a
 * colon to define, a comma to qualify, a full stop to change thought.
 *
 * Scope is what a reader sees — every ENGLISH .mdx under content/docs (including
 * JSX children and PropsTable descriptions), the marketing copy, and the English
 * chrome catalog (lib/i18n/messages/en.ts, which holds the marketing tagline +
 * header/search/pager strings). Translated siblings and translated catalogs are
 * exempt: many target languages use dashes idiomatically. Repo files (CLAUDE.md,
 * ROADMAP.md, code comments) are not covered.
 *
 * Recipe: /human-prose.
 */
const DASH = /[—–]/;

// CONTENT_ROOT is apps/web/content/docs, so the app dir is two levels up, not one.
const APP_ROOT = join(CONTENT_ROOT, "..", "..", "app");
const MARKETING_ROOT = join(APP_ROOT, "(marketing)");
const EN_MESSAGES = join(CONTENT_ROOT, "..", "..", "lib", "i18n", "messages", "en.ts");

/** Every marketing source file (.ts/.tsx, tests excluded) — the landing keeps its
 * copy in components and data modules, so the whole tree is reader-facing. */
function walkMarketing(dir: string = MARKETING_ROOT): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return walkMarketing(full);
    if (!/\.(ts|tsx)$/.test(entry.name) || /\.test\./.test(entry.name)) return [];
    return [full];
  });
}

/** Offending `path:line` entries, each with the line so the failure is actionable. */
function dashLines(text: string, rel: string): string[] {
  return text
    .split("\n")
    .map((line, i) => (DASH.test(line) ? `${rel}:${i + 1}  ${line.trim()}` : null))
    .filter((hit): hit is string => hit !== null);
}

const pages = walkDocs();

describe("docs prose — no em-dashes", () => {
  it("has pages to check (guard is not vacuous)", () => {
    expect(pages.length).toBeGreaterThan(20);
  });

  it("no .mdx page uses an em-dash or en-dash in prose", () => {
    const offenders = pages.flatMap((file) =>
      dashLines(narrativeText(readFileSync(file, "utf8")), relative(CONTENT_ROOT, file)),
    );
    expect(offenders).toEqual([]);
  });

  it("has marketing files to check (guard is not vacuous)", () => {
    expect(walkMarketing().length).toBeGreaterThan(10);
  });

  it("the marketing copy + English chrome catalog use no em-dash or en-dash", () => {
    const strip = (text: string) =>
      text.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " ")).replace(/\/\/.*$/gm, "");
    const offenders = [
      ...walkMarketing().flatMap((file) =>
        dashLines(strip(readFileSync(file, "utf8")), relative(join(APP_ROOT, ".."), file)),
      ),
      ...dashLines(strip(readFileSync(EN_MESSAGES, "utf8")), "lib/i18n/messages/en.ts"),
    ];
    expect(offenders).toEqual([]);
  });
});
