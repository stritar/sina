/**
 * Module-CSS token guard (was the off-grid Tailwind-utility guard).
 *
 * Tailwind is gone; primitives are styled by co-located `*.module.css` that
 * consume `--sina-*` tokens. This guard keeps that honest — the same intent as
 * the old off-grid check, now at the CSS layer, and mirroring the repo-wide
 * `scripts/verify-tokens.mjs`:
 *   1. No raw color literal (`#hex` / `rgb()`) except as a `var(--sina-*, …)`
 *      fallback — colors live in `packages/theme/theme.css` only.
 *   2. Every `var(--sina-*)` carries a fallback (so a primitive renders even if
 *      the token stylesheet is absent). Run `node scripts/codemod-tokens.mjs` to
 *      inject fallbacks; this test fails if any are missing.
 */
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const SRC_DIR = dirname(fileURLToPath(import.meta.url));

function moduleCssFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = join(dir, e.name);
    if (e.isDirectory()) return moduleCssFiles(full);
    return e.name.endsWith(".module.css") ? [full] : [];
  });
}

/** Blank out each `var(--sina-*, FB)` fallback so raw-color scanning skips it. */
function scrubVarFallbacks(css: string): string {
  let out = css;
  let i = 0;
  while ((i = out.indexOf("var(", i)) !== -1) {
    let depth = 0;
    let j = i + 3;
    for (; j < out.length; j++) {
      if (out[j] === "(") depth++;
      else if (out[j] === ")") {
        depth--;
        if (depth === 0) break;
      }
    }
    let d = 0;
    let comma = -1;
    for (let k = i + 4; k < j; k++) {
      if (out[k] === "(") d++;
      else if (out[k] === ")") d--;
      else if (out[k] === "," && d === 0) {
        comma = k;
        break;
      }
    }
    if (comma !== -1) out = out.slice(0, comma + 1) + " ".repeat(j - comma - 1) + out.slice(j);
    i = j + 1;
  }
  return out;
}

describe("module CSS consumes --sina-* tokens, never raw colors", () => {
  const files = moduleCssFiles(SRC_DIR);

  it("finds the module.css files", () => {
    expect(files.length).toBeGreaterThan(20);
  });

  it("has no raw color literal outside a var() fallback", () => {
    const offenders: string[] = [];
    for (const file of files) {
      const scrubbed = scrubVarFallbacks(readFileSync(file, "utf8"));
      for (const [hit] of scrubbed.matchAll(/#[0-9a-fA-F]{3,8}\b|rgba?\(/g)) {
        offenders.push(`${file.slice(SRC_DIR.length + 1)}: ${hit}`);
      }
    }
    expect(offenders, `\n${offenders.join("\n")}\n`).toEqual([]);
  });

  it("every var(--sina-*) carries a fallback", () => {
    const offenders: string[] = [];
    for (const file of files) {
      const css = readFileSync(file, "utf8");
      for (const [hit] of css.matchAll(/var\(\s*--sina-[\w-]+\s*\)/g)) {
        offenders.push(`${file.slice(SRC_DIR.length + 1)}: ${hit}`);
      }
    }
    expect(offenders, `\n${offenders.join("\n")}\n`).toEqual([]);
  });
});
