/**
 * SINA token resolution — shared engine for the codemod + verifier.
 *
 * Parses `packages/theme/theme.css` into a `--sina-*` → value map (the LIGHT
 * `:root` snapshot), and resolves any `var(--sina-*)` chain down to a literal
 * so we can inject stable fallbacks into the component CSS Modules. This mirrors
 * remarkable-sandbox's token-resolver: every managed `var()` gets a fallback so
 * a component still renders if the token stylesheet is ever absent.
 */
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = join(HERE, "..", "..");
export const THEME_CSS = join(REPO_ROOT, "packages/theme/theme.css");

/** Recursively collect files under `dir` matching `test(name)`; skips node_modules/dist. */
export function walk(dir, test) {
  const out = [];
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === "node_modules" || e.name === "dist") continue;
      out.push(...walk(full, test));
    } else if (test(e.name)) {
      out.push(full);
    }
  }
  return out;
}

/** Parse `--sina-NAME: VALUE;` declarations from the top-level `:root{}` block. */
export function parseThemeTokens(themeCssPath = THEME_CSS) {
  const css = readFileSync(themeCssPath, "utf8");
  // First `:root { ... }` block (the light default). `.dark` overrides ignored —
  // the fallback snapshot is intentionally the light value.
  const root = css.match(/:root\s*\{([\s\S]*?)\n\}/);
  const body = root ? root[1] : css;
  const map = new Map();
  const declRe = /(--sina-[\w-]+)\s*:\s*([^;]+);/g;
  let m;
  while ((m = declRe.exec(body))) map.set(m[1], m[2].trim());
  return map;
}

/**
 * Find each top-level `var(...)` in `str` with balanced parens. Returns
 * { start, end, name, fallback } for each (fallback may be null).
 */
function findVars(str) {
  const out = [];
  let i = 0;
  while ((i = str.indexOf("var(", i)) !== -1) {
    let depth = 0;
    let j = i + 3; // at "("
    for (; j < str.length; j++) {
      if (str[j] === "(") depth++;
      else if (str[j] === ")") {
        depth--;
        if (depth === 0) break;
      }
    }
    const inner = str.slice(i + 4, j);
    const comma = splitFirstComma(inner);
    out.push({
      start: i,
      end: j + 1,
      name: comma.head.trim(),
      fallback: comma.tail === null ? null : comma.tail.trim(),
    });
    i = j + 1;
  }
  return out;
}

/** Split on the first comma that is not nested inside parens. */
function splitFirstComma(s) {
  let depth = 0;
  for (let k = 0; k < s.length; k++) {
    if (s[k] === "(") depth++;
    else if (s[k] === ")") depth--;
    else if (s[k] === "," && depth === 0) {
      return { head: s.slice(0, k), tail: s.slice(k + 1) };
    }
  }
  return { head: s, tail: null };
}

/**
 * Fully resolve a value string to a literal: every `var(--sina-*)` is replaced
 * by its resolved value (recursively), preferring the map, then the inline
 * fallback. `localMap` holds a file's own `--sina-<name>-*` component tokens.
 */
export function resolveValue(value, map, localMap = new Map(), seen = new Set()) {
  const vars = findVars(value);
  if (vars.length === 0) return value.trim();
  let out = "";
  let cursor = 0;
  for (const v of vars) {
    out += value.slice(cursor, v.start);
    out += resolveName(v.name, v.fallback, map, localMap, seen);
    cursor = v.end;
  }
  out += value.slice(cursor);
  return out.trim();
}

function resolveName(name, fallback, map, localMap, seen) {
  if (seen.has(name)) return fallback ? resolveValue(fallback, map, localMap, seen) : name;
  const raw = localMap.get(name) ?? map.get(name);
  if (raw == null) {
    // Unknown token: fall back to the inline literal if present, else leave as-is.
    return fallback != null ? resolveValue(fallback, map, localMap, seen) : `var(${name})`;
  }
  const next = new Set(seen);
  next.add(name);
  return resolveValue(raw, map, localMap, next);
}

/** Parse a file's own `:root`/`.root` `--sina-<name>-*` component tokens. */
export function parseLocalTokens(cssText) {
  const map = new Map();
  const declRe = /(--sina-[\w-]+)\s*:\s*([^;]+);/g;
  let m;
  while ((m = declRe.exec(cssText))) map.set(m[1], m[2].trim());
  return map;
}
