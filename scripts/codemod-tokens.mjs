/**
 * SINA token codemod — inject resolved hex/length fallbacks into component CSS.
 *
 * Walks every `packages/{core,fintech-react}/src/**\/*.module.css`, and for each
 * fallback-less `var(--sina-*)` injects `, <resolved literal>` (resolved from
 * theme.css + the file's own component tokens). Keeps the var reference so
 * runtime theming still works; the fallback just makes the component render
 * standalone. Manual one-shot — re-run when theme.css primitive values change.
 *
 *   node scripts/codemod-tokens.mjs          # write
 *   node scripts/codemod-tokens.mjs --check   # dry-run, exit 1 if changes needed
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  REPO_ROOT,
  walk,
  parseThemeTokens,
  parseLocalTokens,
  resolveValue,
} from "./lib/tokens.mjs";

const CHECK = process.argv.includes("--check");
const theme = parseThemeTokens();

const isModuleCss = (n) => n.endsWith(".module.css");
const files = [
  ...walk(join(REPO_ROOT, "packages/core/src"), isModuleCss),
  ...walk(join(REPO_ROOT, "packages/fintech-react/src"), isModuleCss),
];

/** Rewrite bare `var(--sina-X)` → `var(--sina-X, <literal>)`, leaving fallback'd vars alone. */
function inject(css) {
  const local = parseLocalTokens(css);
  // Match var(--sina-NAME) with NO comma before the closing paren.
  return css.replace(/var\(\s*(--sina-[\w-]+)\s*\)/g, (whole, name) => {
    const literal = resolveValue(`var(${name})`, theme, local);
    if (literal === `var(${name})` || literal.includes(`var(${name})`)) return whole; // unresolved → leave
    return `var(${name}, ${literal})`;
  });
}

let changed = 0;
for (const file of files) {
  const before = readFileSync(file, "utf8");
  const after = inject(before);
  if (after !== before) {
    changed++;
    if (CHECK) console.error(`needs fallbacks: ${file.slice(REPO_ROOT.length + 1)}`);
    else writeFileSync(file, after);
  }
}

if (CHECK && changed > 0) {
  console.error(`\n${changed} file(s) missing token fallbacks — run: node scripts/codemod-tokens.mjs`);
  process.exit(1);
}
console.log(`codemod-tokens: ${CHECK ? "checked" : "updated"} ${files.length} file(s), ${changed} changed`);
