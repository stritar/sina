/**
 * Off-grid utility guard.
 *
 * The SINA Tailwind preset (`@sina-design-system/theme/tailwind`) STRICTLY
 * overrides the spacing scale — utilities for values outside the scale are
 * silently dropped (the class renders but produces no CSS), so a primitive can
 * visually collapse with no build error. This test makes that loud: it scans
 * every `core` source file for spacing-family utilities (padding, margin, gap,
 * width/height/size, inset) and fails if any value isn't a key in the preset
 * scale. Add the value to the preset's `spacing` (and `theme.css`) — don't reach
 * off-grid.
 */
import { createRequire } from "node:module";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
// The preset is CJS; its `theme.spacing` keys are the allowed scale values.
const preset = require("@sina-design-system/theme/tailwind");
const allowedValues = new Set(Object.keys(preset.theme.spacing).map(String));

const SRC_DIR = dirname(fileURLToPath(import.meta.url));

/** Spacing-family utility prefixes — all draw from the Tailwind `spacing` scale. */
const PREFIXES = [
  "gap-x", "gap-y", "gap",
  "px", "py", "pt", "pb", "pl", "pr", "p",
  "mx", "my", "mt", "mb", "ml", "mr", "m",
  "space-x", "space-y",
  "min-w", "min-h", "max-w", "max-h",
  "inset-x", "inset-y", "inset",
  "size", "w", "h", "top", "right", "bottom", "left",
];
// Optional leading negative (`-mt-2`) + optional variant prefixes (`sm:`,
// `hover:`, `group-data-[...]:`) then `<prefix>-<value>`.
const UTILITY_RE = new RegExp(
  `(?:^|[\\s"'\`])-?(?:${PREFIXES.join("|")})-(\\[[^\\]]+\\]|[a-z0-9./]+)`,
  "g",
);
// Only numeric values (`7`, `1.5`) resolve through the `spacing` scale and are
// silently dropped when off-scale — that's the bug we guard against. Keyword
// values (`md`, `full`, `control-xs`), fractions, and arbitrary `[…]` values
// draw from other scales (size/maxWidth/…) and are never the silent-drop case.
const isNumeric = (v: string) => /^\d+(\.\d+)?$/.test(v);

function tsxFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = join(dir, e.name);
    if (e.isDirectory()) return tsxFiles(full);
    if (e.name.endsWith(".tsx") && !e.name.endsWith(".test.tsx")) return [full];
    return [];
  });
}

describe("no off-grid spacing utilities in core", () => {
  it("every spacing-family utility resolves to a preset scale value", () => {
    const violations: string[] = [];
    for (const file of tsxFiles(SRC_DIR)) {
      const src = readFileSync(file, "utf8");
      const rel = file.slice(SRC_DIR.length + 1);
      for (const [, value] of src.matchAll(UTILITY_RE)) {
        if (!isNumeric(value)) continue;
        if (!allowedValues.has(value)) {
          violations.push(`${rel}: off-grid value "-${value}" (not in preset spacing scale)`);
        }
      }
    }
    expect(violations, `\n${violations.join("\n")}\n`).toEqual([]);
  });
});
