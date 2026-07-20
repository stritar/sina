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
 *   7. the gate verdict palette leans without converging, and its ink never moves
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

describe("gate verdict palette", () => {
  // The gate palette is the one carve-out from "industry tints the brand, never
  // the semantics", and it is safe only because it moves in a very particular
  // way: the fills lean partway toward the industry hue, the inks do not move at
  // all, and the triad never converges. Each of those three is asserted here,
  // because each is a one-character edit away from being false — `GATE_TINT` is
  // a single number, and the ink is emitted by a line that could just as easily
  // have been routed through `tint()`.
  const VERDICTS = ["pass", "escalate", "reject", "flag"] as const;
  const fillOf = (v: string) => `--sinamk-color-gate-${v}-bg--solid`;
  const inkOf = (v: string) => `--sinamk-color-gate-${v}-fg--solid`;

  /** OKLCH hue in degrees. Enough of the transform to compare two hues. */
  function hue(hex: string): number {
    const lin = (i: number) => {
      const s = parseInt(hex.slice(i + 1, i + 3), 16) / 255;
      return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    };
    const [r, g, b] = [lin(0), lin(2), lin(4)];
    const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
    const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
    const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
    const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
    const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
    return ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360;
  }

  /** Shortest angular distance between two hues, in degrees. */
  const apart = (a: number, b: number) => Math.abs((((a - b) % 360) + 540) % 360 - 180);

  it.each(THEMES)("%s: the ink is identical across all three industries", (theme) => {
    for (const v of VERDICTS) {
      const inks = INDUSTRIES.map((i) => pick(paletteOf(i, theme), inkOf(v)));
      expect(new Set(inks).size, `${v} inks: ${inks.join(", ")}`).toBe(1);
    }
  });

  it.each(THEMES)("%s: the fill does lean toward the industry", (theme) => {
    // The inverse failure of the one above: a gate family accidentally dropped
    // from the generator's loop would still pass every other test in this file,
    // because an untinted token is trivially luminance-parity-safe. At least one
    // verdict must actually move per industry, or the feature is inert.
    for (const industry of ["healthcare", "defense"]) {
      const base = paletteOf("fintech", theme);
      const other = paletteOf(industry, theme);
      const moved = VERDICTS.filter((v) => pick(base, fillOf(v)) !== pick(other, fillOf(v)));
      expect(moved.length, `${industry}/${theme}: no gate fill moved`).toBeGreaterThan(0);
    }
  });

  it.each(THEMES)("%s: the triad never converges", (theme) => {
    // Raising GATE_TINT pulls the verdicts toward one another. Below ~25deg of
    // separation a reader stops reading the colour and starts relying on the
    // label alone, which is the point at which the palette has stopped working.
    // `flag` is excluded: it is the near-achromatic neutral, so its hue is noise.
    const TRIAD = ["pass", "escalate", "reject"] as const;
    for (const industry of INDUSTRIES) {
      const p = paletteOf(industry, theme);
      for (let i = 0; i < TRIAD.length; i++) {
        for (let j = i + 1; j < TRIAD.length; j++) {
          const [a, b] = [pick(p, fillOf(TRIAD[i]!)), pick(p, fillOf(TRIAD[j]!))];
          expect(
            apart(hue(a), hue(b)),
            `${industry}/${theme} ${TRIAD[i]} ${a} vs ${TRIAD[j]} ${b}`,
          ).toBeGreaterThan(25);
        }
      }
    }
  });

  for (const theme of THEMES) {
    for (const industry of INDUSTRIES) {
      it(`${industry}/${theme}: every verdict chip carries its ink at AA`, () => {
        const p = paletteOf(industry, theme);
        for (const v of VERDICTS) {
          expect(
            contrast(pick(p, fillOf(v)), pick(p, inkOf(v))),
            `gate-${v}`,
          ).toBeGreaterThanOrEqual(4.5);
        }
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

describe("hero emulator industry tag", () => {
  // The chip is the one place the industry names itself, so it is the one place
  // the tint is meant to be obvious rather than a wash. Three claims:
  //
  //   1. it carries its white ink at AA in every industry and both themes,
  //   2. the three industries actually differ (a collapsed hue would make the
  //      chip say "fintech" in fintech colours on all three pages), and
  //   3. the ink never moves, so the chip's contrast is a property of the fill.
  const BG = "--sina-industry-tag-bg";
  const FG = "--sina-industry-tag-fg";

  for (const theme of THEMES) {
    for (const industry of INDUSTRIES) {
      it(`${industry}/${theme}: the chip carries its ink at AA`, () => {
        const p = paletteOf(industry, theme);
        expect(contrast(pick(p, FG), pick(p, BG))).toBeGreaterThanOrEqual(4.5);
      });
    }

    it(`${theme}: every industry gets a distinct fill on one shared ink`, () => {
      const fills = INDUSTRIES.map((i) => pick(paletteOf(i, theme), BG));
      expect(new Set(fills).size).toBe(INDUSTRIES.length);

      const inks = INDUSTRIES.map((i) => pick(paletteOf(i, theme), FG));
      expect(new Set(inks).size).toBe(1);
    });
  }

  // The whole point of the luminance pin: one contrast number covers all three,
  // so the chip never needs per-industry tuning.
  //
  // Asserted on the RATIO, not on raw luminance. An absolute luminance
  // tolerance is not a fixed unit of anything — near the dark accent's Y~0.545
  // a single step of the 8-bit sRGB ramp is already worth ~0.004, so any bound
  // tight enough to be meaningful in light is below the representable floor in
  // dark. The ratio is what the pin is for and it holds in both themes.
  it.each(THEMES)("%s: all three fills carry their ink at one ratio", (theme) => {
    const ratios = INDUSTRIES.map((i) => {
      const p = paletteOf(i, theme);
      return contrast(pick(p, FG), pick(p, BG));
    });
    expect(Math.max(...ratios) - Math.min(...ratios)).toBeLessThan(0.1);
  });

  // Fintech is the reference and must round-trip to the value signed off in
  // Figma (node 234:2403), not to whatever the OKLCH conversion drifts to.
  it("light: fintech round-trips to the authored teal", () => {
    expect(pick(paletteOf("fintech", "light"), BG)).toBe("#0f766e");
  });

  // Dark inverts (pale fill, near-black ink) rather than reusing the light
  // solid, the same way ButtonPrimary and the gate palette do. Asserted as a
  // relation, not a hex, so retuning the dark primary pastel carries the accent
  // rather than breaking this.
  it("dark: the accent inverts to a pale fill on dark ink", () => {
    const light = paletteOf("fintech", "light");
    const dark = paletteOf("fintech", "dark");
    expect(luminance(pick(dark, BG))).toBeGreaterThan(luminance(pick(light, BG)));
    expect(luminance(pick(dark, FG))).toBeLessThan(luminance(pick(dark, BG)));
  });
});

describe("hero segment selector's chosen pill", () => {
  // The pill and the chip are one statement: the selector picks the industry,
  // the chip reports it. They must stay the same colour, and the pill has one
  // requirement the chip does not — it is a filled shape sitting ON the track,
  // so its EDGE has to be findable, not just its text. A deep light-mode solid
  // reused in dark lands at 2.4:1 here, which is what the inversion above
  // exists to fix; this is the test that catches it coming back.
  const FILL = "--sinamk-color-segment-fill--active";
  const INK = "--sinamk-color-segment-fg--active";
  const TRACK = "--sinamk-color-secondary-fill";

  for (const theme of THEMES) {
    for (const industry of INDUSTRIES) {
      it(`${industry}/${theme}: the pill matches the chip exactly`, () => {
        const p = paletteOf(industry, theme);
        expect(pick(p, FILL)).toBe(pick(p, "--sina-industry-tag-bg"));
        expect(pick(p, INK)).toBe(pick(p, "--sina-industry-tag-fg"));
      });

      it(`${industry}/${theme}: the pill carries its ink at AA and its edge at 3:1`, () => {
        const p = paletteOf(industry, theme);
        expect(contrast(pick(p, INK), pick(p, FILL))).toBeGreaterThanOrEqual(4.5);
        expect(contrast(pick(p, FILL), pick(p, TRACK))).toBeGreaterThanOrEqual(3);
      });
    }
  }
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
