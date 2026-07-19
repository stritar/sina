/**
 * Guards for the per-industry landing tint (industry-tint.css).
 *
 * The tint's whole safety argument is that healthcare and defense are the sage
 * anchor with ONLY its OKLCH hue changed, so all three industries land at the
 * same relative luminance and every WCAG ratio holds for all of them at once.
 * These tests hold that argument up:
 *
 *   1. the committed CSS still matches what the generator produces (no hand-edits)
 *   2. luminance parity across industries (the assertion the safety rests on)
 *   3. the resulting contrast matrix clears AA, measured through the cascade
 *   4. the glyph-field values stay literal hex (the canvas cannot parse anything else)
 *   5. every rule is theme-qualified (the :has() specificity trap)
 *   6. the governance-locked roles are never tinted
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { css as generated, derive } from "../../../../../scripts/gen-industry-tints.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const FILE = join(DIR, "industry-tint.css");
const source = readFileSync(FILE, "utf8");

const INDUSTRIES = ["fintech", "healthcare", "defense"] as const;
const THEMES = ["light", "dark"] as const;

/** Relative luminance per WCAG 2.x (same shape as packages/theme/src/tokens.test.ts). */
function luminance(hex: string): number {
  const lin = (i: number) => {
    const s = parseInt(hex.slice(i + 1, i + 3), 16) / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(0) + 0.7152 * lin(2) + 0.0722 * lin(4);
}

function contrast(a: string, b: string): number {
  const [la, lb] = [luminance(a), luminance(b)];
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/** The derived palette for one industry+theme, as a name -> hex lookup. */
const paletteOf = (industry: string, theme: string) =>
  Object.fromEntries(derive(industry, theme)) as Record<string, string | undefined>;

/** Look a token up, failing loudly rather than silently comparing `undefined`. */
function pick(palette: Record<string, string | undefined>, name: string): string {
  const hex = palette[name];
  if (!hex) throw new Error(`token not derived: ${name}`);
  return hex;
}

describe("industry-tint.css is generated, not hand-edited", () => {
  it("matches the generator output exactly", () => {
    expect(source).toBe(generated);
  });
});

describe("contrast parity across industries", () => {
  // The load-bearing assertion: healthcare and defense must behave like fintech
  // wherever contrast is concerned, so one contrast matrix can cover all three.
  //
  // Parity is measured as each token's contrast ratio against black and against
  // white, within 2% of fintech's — rather than as a raw luminance delta, which
  // is unusable at the ends of the range. Near white a single 8-bit channel step
  // already moves relative luminance by ~0.002, so any absolute tolerance tight
  // enough to be meaningful mid-ramp is unsatisfiable at the extremes. Ratios
  // are scale-free and are what the WCAG floors are actually made of.
  it.each(THEMES)("%s: every token holds fintech's contrast behaviour", (theme) => {
    const base = paletteOf("fintech", theme);
    for (const industry of ["healthcare", "defense"]) {
      const other = paletteOf(industry, theme);
      for (const name of Object.keys(base)) {
        const hex = pick(base, name);
        const alt = pick(other, name);
        for (const ref of ["#000000", "#ffffff"]) {
          const a = contrast(hex, ref);
          const b = contrast(alt, ref);
          expect(
            Math.abs(a - b) / a,
            `${industry}/${theme} ${name} vs ${ref}: ${hex} (${a.toFixed(2)}:1) vs ${alt} (${b.toFixed(2)}:1)`,
          ).toBeLessThan(0.02);
        }
      }
    }
  });
});

describe("WCAG 2.2 AA contrast, all industries x both themes", () => {
  // Normal text >= 4.5:1.
  const TEXT = [
    ["--sina-color-text", "--sina-color-bg"],
    ["--sina-color-text", "--sina-color-surface"],
    ["--sina-color-text-muted", "--sina-color-bg"],
    ["--sina-color-text-muted", "--sina-color-surface"],
    ["--sinamk-color-text", "--sinamk-color-bg"],
    ["--sinamk-color-text-muted", "--sinamk-color-surface"],
  ] as const;

  for (const theme of THEMES) {
    for (const industry of INDUSTRIES) {
      const p = paletteOf(industry, theme);
      it.each(TEXT)(`${industry}/${theme}: %s on %s meets AA (4.5:1)`, (fg, bg) => {
        expect(contrast(pick(p, fg), pick(p, bg))).toBeGreaterThanOrEqual(4.5);
      });

      // text-subtle is a 3:1 role (decorative / large / icon), matching the
      // policy in packages/theme/src/tokens.test.ts.
      it(`${industry}/${theme}: text-subtle meets the 3:1 floor`, () => {
        expect(
          contrast(pick(p, "--sina-color-text-subtle"), pick(p, "--sina-color-bg")),
        ).toBeGreaterThanOrEqual(3);
        expect(
          contrast(pick(p, "--sinamk-color-text-subtle"), pick(p, "--sinamk-color-bg")),
        ).toBeGreaterThanOrEqual(3);
      });

      it(`${industry}/${theme}: primary fill carries its foreground at AA`, () => {
        expect(
          contrast(pick(p, "--sinamk-color-primary-fg"), pick(p, "--sinamk-color-primary-fill")),
        ).toBeGreaterThanOrEqual(4.5);
      });
    }
  }
});

describe("glyph-field palette stays machine-readable", () => {
  // gl/color.ts parseColor() understands only #hex and rgb(), and returns its
  // fallback on anything else — silently, with no error and no visual clue. A
  // color-mix()/oklch() value here would leave the canvas permanently sage.
  it("declares every --sina-glyphfield-* as a literal 6-digit hex", () => {
    const decls = [...source.matchAll(/--sina-glyphfield-[\w-]+:\s*([^;]+);/g)];
    expect(decls.length).toBe(INDUSTRIES.length * THEMES.length * 3);
    for (const decl of decls) {
      expect(decl[1]?.trim()).toMatch(/^#[0-9a-f]{6}$/);
    }
  });
});

describe("cascade safety", () => {
  // :has() takes the specificity of its most specific argument, so
  // `[data-industry=x] body:has(.sina-wireframe)` weighs the same (0,2,1) as
  // `[data-theme=dark] body:has(.sina-wireframe)`. An unqualified industry rule
  // would tie the dark base block and win on source order, silently breaking
  // dark mode. Every selector must therefore state its theme.
  it("qualifies every industry selector with a theme", () => {
    const selectors = [...source.matchAll(/^(html[^{]*?)[,{]/gm)].map((m) => m[1]?.trim() ?? "");
    expect(selectors.length).toBeGreaterThan(0);
    for (const sel of selectors) {
      expect(sel, `unqualified selector: ${sel}`).toMatch(
        /\[data-theme="dark"\]|:not\(\[data-theme="dark"\]\)/,
      );
    }
  });

  // Otherwise the attribute on <html> would restyle /showcase and the docs.
  it("scopes every rule to the landing marker", () => {
    const selectors = [...source.matchAll(/^(html[^{]*?)[,{]/gm)].map((m) => m[1] ?? "");
    for (const sel of selectors) {
      expect(sel).toContain("body:has(.sina-wireframe)");
    }
  });
});

describe("governance roles are never tinted", () => {
  // packages/theme/src/create-theme.ts locks these out of BrandTheme: a
  // governance signal must not change meaning because the visitor picked a
  // different industry. The marketing focus ring is pinned by
  // marketing-focus.test.tsx and is likewise off-limits.
  it.each([
    "--sina-color-danger",
    "--sina-color-danger-fg",
    "--sina-color-danger-bg",
    "--sina-color-danger-fill",
    "--sina-color-focus-ring",
    "--sina-color-surface-secure",
    "--sina-shadow-color",
    "--sinamk-color-focus-ring",
    "--sinamk-color-destructive-fill",
    "--sinamk-color-text-danger",
  ])("%s is absent from the tint sheet", (token) => {
    expect(source).not.toContain(`${token}:`);
  });
});
