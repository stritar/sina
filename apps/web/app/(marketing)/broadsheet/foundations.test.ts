import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

/**
 * Guard for the CLAUDE.md rule: "Broadsheet components consume foundations,
 * never raw values."
 *
 * Every themed value in a component *.module.css must resolve to a --sinamk-*
 * token via var(--sinamk-*, <fallback>); raw colors/lengths live only in
 * broadsheet.css. A var(--sinamk-*) with no fallback, or a raw color literal
 * sitting outside a var() fallback, fails the build. Recipe: /broadsheet-foundations.
 */
const DIR = dirname(fileURLToPath(import.meta.url));

function stripComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

/** Blank out var(...) calls (no nested parens by convention) so only raw literals remain. */
function removeVarCalls(css: string): string {
  const re = /var\([^()]*\)/g;
  let prev = "";
  let out = css;
  while (out !== prev) {
    prev = out;
    out = out.replace(re, " ");
  }
  return out;
}

const RAW_COLOR = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab|lab|lch)\s*\(/;
const FALLBACKLESS = /var\(\s*--sinamk-[A-Za-z0-9-]+\s*\)/g;

const modules = readdirSync(DIR)
  .filter((file) => file.endsWith(".module.css"))
  .map((file) => ({ name: file, css: stripComments(readFileSync(join(DIR, file), "utf8")) }));

describe("broadsheet foundations", () => {
  it("has component modules to check (guard is not vacuous)", () => {
    expect(modules.length).toBeGreaterThan(0);
  });

  it("every var(--sinamk-*) carries a fallback", () => {
    const offenders = modules.flatMap(({ name, css }) =>
      [...css.matchAll(FALLBACKLESS)].map((match) => `${name}: ${match[0]}`),
    );
    expect(offenders).toEqual([]);
  });

  it("no raw color literal outside a --sinamk-* var() fallback", () => {
    const offenders = modules
      .filter(({ css }) => RAW_COLOR.test(removeVarCalls(css)))
      .map(({ name }) => name);
    expect(offenders).toEqual([]);
  });
});
