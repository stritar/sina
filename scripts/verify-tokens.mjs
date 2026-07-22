/**
 * SINA token verifier — the CSS-Modules guard (mirrors remarkable's verify:tokens).
 *
 * Scans every `packages/{core,fintech-react}/src/**\/*.module.css` and asserts:
 *   1. No raw color literal (`#hex` / `rgb()` / `rgba()`) EXCEPT as the fallback
 *      argument of a `var(--sina-*, <fallback>)`. Colors live in theme.css only.
 *   2. Every `var(--sina-*)` carries a fallback (so components render standalone).
 * Exits 1 on any violation. Wire into CI / `pnpm verify:tokens`.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { REPO_ROOT, walk } from "./lib/tokens.mjs";

const isModuleCss = (n) => n.endsWith(".module.css");
const files = [
  ...walk(join(REPO_ROOT, "packages/core/src"), isModuleCss),
  ...walk(join(REPO_ROOT, "packages/fintech-react/src"), isModuleCss),
];

const violations = [];

for (const file of files) {
  const css = readFileSync(file, "utf8");
  const rel = file.slice(REPO_ROOT.length + 1);

  // (2) bare var(--sina-X) with no fallback.
  for (const m of css.matchAll(/var\(\s*--sina-[\w-]+\s*\)/g)) {
    violations.push(`${rel}: missing fallback → ${m[0]}`);
  }

  // (1) raw colors outside a var() fallback slot. Blank out fallback args first
  // (the text after the first top-level comma inside each var()), then look for
  // any remaining hex / rgb() — those are unmanaged raw colors.
  const scrubbed = scrubVarFallbacks(css);
  for (const m of scrubbed.matchAll(/#[0-9a-fA-F]{3,8}\b|rgba?\(/g)) {
    violations.push(`${rel}: raw color literal → ${m[0]} (use var(--sina-*))`);
  }
}

if (violations.length) {
  console.error(`verify-tokens: ${violations.length} violation(s):\n` + violations.join("\n"));
  process.exit(1);
}
console.log(`verify-tokens: OK (${files.length} module.css file(s))`);

/** Replace the fallback portion of each var(--sina-*, FB) with spaces so raw-color scan skips it. */
function scrubVarFallbacks(css) {
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
    // find first top-level comma inside (i+4 .. j)
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
    if (comma !== -1) {
      out = out.slice(0, comma + 1) + " ".repeat(j - comma - 1) + out.slice(j);
    }
    i = j + 1;
  }
  return out;
}
