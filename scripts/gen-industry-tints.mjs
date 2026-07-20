/**
 * SINA industry-tint generator.
 *
 * The landing page carries a per-industry tint (fintech = sage, healthcare =
 * clinical azure, defense = desert sand). Every tinted value is derived from the
 * SAGE anchor by converting to OKLCH, replacing ONLY the hue, and converting
 * back. Lightness and chroma are held constant, which is the whole point:
 *
 *   WCAG contrast is a function of relative luminance alone. Holding OKLCH L and
 *   C fixed keeps luminance within ~0.003 across all three hues, so every
 *   contrast ratio the page satisfies for sage is satisfied for the other two
 *   BY CONSTRUCTION. No per-industry contrast tuning, ever.
 *
 * Two anchor sources, two transforms:
 *   - `broadsheet.css` + `GlyphField.module.css` already carry sage chroma, so
 *     those tokens are ROTATED (their own C is preserved).
 *   - `wireframe.css` is near-achromatic (that is why sage never reached below
 *     the hero), so those tokens get chroma INJECTED at a per-role budget, then
 *     rotated. Fintech therefore gains a faint sage wash it did not have before.
 *
 * Anchors are read out of the source CSS rather than duplicated here, so this
 * script cannot drift from the files it derives from.
 *
 * Run: `node scripts/gen-industry-tints.mjs`
 * Emits: apps/web/app/(marketing)/landing/industry-tint.css
 * Guard: apps/web/app/(marketing)/landing/industry-tint.test.ts (drift + parity)
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { REPO_ROOT } from "./lib/tokens.mjs";

const WEB = join(REPO_ROOT, "apps/web/app/(marketing)");
const OUT = join(WEB, "landing/industry-tint.css");

/**
 * Hue (OKLCH degrees) per industry. `null` = keep the anchor's own hue, which is
 * what makes fintech round-trip to its authored sage hexes byte-for-byte
 * (broadsheet's sage spans 127-138deg, so pinning it to a single number would
 * quietly restyle the existing palette).
 */
const INDUSTRIES = { fintech: null, healthcare: 250, defense: 65 };

/**
 * The fallback hue for CHROMA-INJECTED tokens. An achromatic anchor like
 * `#f4f4f4` has no meaningful hue (atan2 over near-zero a/b is numerical noise),
 * so "keep the anchor's own hue" would hand fintech an arbitrary tint. The
 * wireframe ramp therefore anchors to sage explicitly.
 */
const SAGE_HUE = 133;

/**
 * Light-mode chroma multiplier — the one saturation knob.
 *
 * Light surfaces sit near white, where a given chroma reads far weaker than the
 * same chroma on a dark ground, so the light page needed a lift to make the
 * industry legible at a glance. 1.2 raises HSL saturation by roughly two
 * percentage points across the ramp (page bg ~5% -> ~7%).
 *
 * Turn this one number to make the whole light page more or less colourful. It
 * scales all three industries together and does not touch hue or lightness, so
 * the contrast parity guarantee in industry-tint.test.ts survives any value that
 * stays in gamut (the guard will say so if it does not). Dark mode is
 * deliberately left at 1.
 */
const LIGHT_CHROMA_BOOST = 1.2;

/* ----------------------------------------------------------------------- */
/* sRGB <-> OKLab                                                          */
/* ----------------------------------------------------------------------- */

const toLinear = (v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
const toGamma = (v) => (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055);
const clamp01 = (v) => Math.min(1, Math.max(0, v));

function hexToOklch(hex) {
  const [R, G, B] = [0, 2, 4].map((i) => parseInt(hex.slice(i + 1, i + 3), 16));
  const r = toLinear(R / 255), g = toLinear(G / 255), b = toLinear(B / 255);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const Bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return { L, C: Math.hypot(A, Bb), H: ((Math.atan2(Bb, A) * 180) / Math.PI + 360) % 360 };
}

function oklchToHex({ L, C, H }) {
  const rad = (H * Math.PI) / 180;
  const a = C * Math.cos(rad), b = C * Math.sin(rad);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const ch = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map((v) => Math.round(clamp01(toGamma(v)) * 255));
  return `#${ch.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

/**
 * Fade injected chroma out as an anchor approaches white or black.
 *
 * Two reasons, and they agree. Practically, sRGB has almost no gamut left at the
 * extremes, so a full-chroma near-white clips on one channel and the luminance
 * match below cannot converge. Aesthetically, near-white body text and near-black
 * ground should read as neutral: the tint belongs in surfaces, borders and
 * accents, not in the ink. Applied only to the injected wireframe ramp — the
 * broadsheet anchors are hand-authored and already gamut-safe.
 *
 * Applied only to a role that declares a chroma BUDGET. A role whose budget is
 * null is already tinted at its anchor and must not be re-derived at all; see
 * the note in `push()`.
 */
function taper(hex, chroma) {
  const { L } = hexToOklch(hex);
  return chroma * Math.min(1, Math.min(L, 1 - L) / 0.18);
}

/** WCAG 2.x relative luminance of a hex. */
function relLuminance(hex) {
  const ch = [0, 2, 4].map((i) => toLinear(parseInt(hex.slice(i + 1, i + 3), 16) / 255));
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}

/**
 * Re-hue `hex`, optionally forcing chroma. Pure black/white are returned as-is.
 *
 * When `targetY` is given, OKLCH lightness is then nudged until the result's
 * WCAG luminance matches it. Constant OKLab L is *perceptual* uniformity, which
 * is not the same thing as constant relative luminance — the gap grows with
 * chroma and reached 0.006 on our own ramp, enough to make "all industries share
 * one contrast guarantee" an approximation rather than a fact. A dozen bisection
 * steps close it to the 8-bit rounding floor and make the claim exact.
 */
function tint(hex, hue, chroma, targetY) {
  const src = hexToOklch(hex);
  if (src.L <= 0.001 || src.L >= 0.999) return hex; // #000/#fff carry no hue
  const C = chroma ?? src.C;
  const H = hue ?? src.H;
  if (targetY == null) return oklchToHex({ L: src.L, C, H });

  let lo = 0, hi = 1;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (relLuminance(oklchToHex({ L: mid, C, H })) < targetY) lo = mid;
    else hi = mid;
  }
  return oklchToHex({ L: (lo + hi) / 2, C, H });
}

/* ----------------------------------------------------------------------- */
/* Anchors                                                                 */
/* ----------------------------------------------------------------------- */

/**
 * Read `--name: #hex;` pairs out of one CSS block. `blockRe` must capture the
 * block body in group 1.
 */
function readBlock(file, blockRe) {
  const css = readFileSync(join(WEB, file), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  const m = css.match(blockRe);
  if (!m) throw new Error(`${file}: block not found (${blockRe})`);
  const out = new Map();
  for (const d of m[1].matchAll(/(--[\w-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)) {
    out.set(d[1], d[2].toLowerCase());
  }
  return out;
}

/**
 * The sage family inside broadsheet.css. Everything NOT listed here keeps its
 * authored value: the badge palette, the destructive/danger ramp, the tooltip,
 * and `--sinamk-color-focus-ring` (which `marketing-focus.test.tsx` pins to
 * #2563eb). Industry tints the brand, never the semantics.
 */
const BROADSHEET_SAGE = [
  "secondary-fill", "secondary-fill--hover", "secondary-fill--pressed",
  "secondary-fill--disabled", "secondary--hover",
  "primary-fill", "primary-fill--hover", "primary-fill--pressed",
  "primary-fill--disabled", "primary-fg", "primary-fg--disabled",
  "text", "text-strong", "text-muted", "text-subtle", "text--disabled",
  "bg", "surface", "border",
  "field-bg", "field-bg--disabled", "field-border", "field-border--hover",
  "field-placeholder", "code-bg", "popover-surface",
].map((n) => `--sinamk-color-${n}`);

/**
 * The wireframe ramp is achromatic, so each role declares how much chroma to
 * absorb. Budgets mirror the sage family they sit beside: surfaces are a whisper
 * (sage's secondary-fill is C=0.006), text carries the most (text-muted, 0.017).
 *
 * A `null` budget means the role is NOT achromatic: its anchor already carries
 * the sage chroma, so it hue-rotates and keeps it, exactly as a broadsheet anchor
 * does. `--sina-color-bg` is the one such role — it is authored byte-identical to
 * `--sinamk-color-bg` and `--sina-glyphfield-bg`, and injecting a budget over the
 * top is what made the page ground drift away from the glyph field and the chat
 * thread sitting on it. See the note in `push()`.
 *
 * Absent from this map, and therefore untinted on purpose: the whole `danger*`
 * ramp, `focus-ring`, `surface-secure` and `shadow-color`. Those are the
 * governance-locked roles (`governanceLockedColorTokens` in
 * packages/theme/src/create-theme.ts) — a governance signal must not change
 * meaning because the visitor picked a different industry.
 */
const WIREFRAME_CHROMA = {
  "--sina-color-bg": null,
  "--sina-color-surface": 0.004,
  "--sina-color-surface-raised": 0.004,
  "--sina-color-surface-sunken": 0.006,
  "--sina-color-text": 0.012,
  "--sina-color-text-muted": 0.017,
  "--sina-color-text-subtle": 0.017,
  "--sina-color-border": 0.010,
  "--sina-color-border-subtle": 0.008,
  "--sina-color-primary": 0.019,
  "--sina-color-primary--hover": 0.019,
  "--sina-color-primary--active": 0.019,
  "--sina-color-secondary": 0.008,
  "--sina-color-secondary--hover": 0.008,
  "--sina-color-neutral-bg": 0.006,
};

/**
 * The glyph-field anchors live HERE rather than being read back out of
 * `GlyphField.module.css`, because that module no longer declares them.
 *
 * It cannot: a CSS Module class sets custom properties directly ON the canvas
 * root, and a value set on an element always beats one inherited from an
 * ancestor, so a `.root { --sina-glyphfield-*: sage }` block would silently win
 * over every industry tint. The module keeps only `var(--sina-glyphfield-bg,
 * <fallback>)` reads, and these values inherit down from the landing scope.
 */
const GLYPH_ANCHORS = {
  light: {
    "--sina-glyphfield-bg": "#f5f6f4",
    "--sina-glyphfield-primary": "#ced3c8",
    "--sina-glyphfield-accent": "#a3a6a1",
  },
  dark: {
    "--sina-glyphfield-bg": "#0b0c0b",
    "--sina-glyphfield-primary": "#2c332c",
    "--sina-glyphfield-accent": "#363e35",
  },
};

const anchors = {
  broadsheet: {
    light: readBlock("broadsheet/broadsheet.css", /\n\.broadsheet\s*\{([\s\S]*?)\n\}/),
    dark: readBlock("broadsheet/broadsheet.css", /\[data-theme="dark"\]\s*\.broadsheet\s*\{([\s\S]*?)\n\}/),
  },
  wireframe: {
    light: readBlock("wireframe.css", /\nbody:has\(\.sina-wireframe\)\s*\{([\s\S]*?)\n\}/),
    dark: readBlock("wireframe.css", /\[data-theme="dark"\]\s*body:has\(\.sina-wireframe\)\s*\{([\s\S]*?)\n\}/),
  },
};

/**
 * Broadsheet anchors the landing re-points at the wireframe ground before tinting.
 *
 * The two grounds agree in light (both authored `#f5f6f4`), so the chat thread sits
 * flush with the page. They do NOT agree in dark: broadsheet is a soft sage-black
 * `#131512` while the landing runs the deliberately near-black inverted wireframe
 * (`#0b0c0b`, see the header note in wireframe.css). The thread then read as a
 * lifted panel in dark and a flush one in light, from one unchanged component.
 *
 * Substituting the anchor HERE rather than editing broadsheet.css is what keeps
 * this landing-only: every rule in this sheet is scoped to
 * `body:has(.sina-wireframe)`, so `/showcase` and the rest of the marketing layer
 * keep the real `#131512` foundation. Changing that file would be a foundation
 * edit, which the broadsheet-foundations rule gates behind design sign-off.
 *
 * Ground only. `--sinamk-color-surface` and the field/popover surfaces are left
 * alone, so they simply read as a larger lift off the darker ground.
 *
 * The value is READ from the wireframe anchor rather than restated, so retuning
 * the dark page ground in wireframe.css carries the thread with it.
 */
const LANDING_GROUND_OVERRIDE = {
  dark: { "--sinamk-color-bg": anchors.wireframe.dark.get("--sina-color-bg") },
};

/**
 * Every derived declaration for one industry + theme, as `[name, hex]`.
 *
 * Fintech is the reference: it is generated first, and healthcare/defense are
 * then pinned to ITS luminance token by token. That is what lets one contrast
 * matrix cover all three industries.
 */
export function derive(industry, theme) {
  const hue = INDUSTRIES[industry];
  const reference = industry === "fintech" ? null : new Map(derive("fintech", theme));
  const boost = theme === "light" ? LIGHT_CHROMA_BOOST : 1;
  const out = [];
  const push = (name, hex, chroma) => {
    const targetY = reference ? relLuminance(reference.get(name)) : null;
    // A role that states a chroma budget absorbs it (tapered); one whose budget
    // is null keeps whatever chroma its own anchor already carries, which is the
    // same path every broadsheet anchor takes.
    //
    // That distinction is load-bearing for the page ground. Injecting a budget
    // into a hex that is ALREADY tinted re-derives it to a different colour than
    // an identical hex elsewhere in the sheet, and the landing has exactly that:
    // `--sina-color-bg` is authored `#f5f6f4` / `#0b0c0b`, byte-identical to
    // `--sinamk-color-bg` (light) and `--sina-glyphfield-bg` (both themes). The
    // budget broke the tie in both directions — taper() at L~0.96 cut the light
    // ground to a fifth of the broadsheet chroma, and at L~0.1 it OVER-tinted the
    // dark ground past the glyph field. Either way the hero showed a seam where
    // the glyph field and the chat thread met the page. Deriving the ground from
    // its own anchor keeps the three in lockstep by construction.
    const C = (chroma ? taper(hex, chroma) : hexToOklch(hex).C) * boost;
    out.push([name, tint(hex, chroma ? (hue ?? SAGE_HUE) : hue, C, targetY)]);
  };

  for (const name of BROADSHEET_SAGE) {
    const hex = LANDING_GROUND_OVERRIDE[theme]?.[name] ?? anchors.broadsheet[theme].get(name);
    if (hex) push(name, hex);
  }
  for (const [name, chroma] of Object.entries(WIREFRAME_CHROMA)) {
    const hex = anchors.wireframe[theme].get(name);
    if (hex) push(name, hex, chroma);
  }
  for (const [name, hex] of Object.entries(GLYPH_ANCHORS[theme])) {
    push(name, hex);
  }
  return out;
}

/* ----------------------------------------------------------------------- */
/* Emit                                                                    */
/* ----------------------------------------------------------------------- */

/**
 * Selectors are ALWAYS theme-qualified. `:has()` takes the specificity of its
 * most specific argument, so `[data-industry=x] body:has(.sina-wireframe)` and
 * `[data-theme=dark] body:has(.sina-wireframe)` both weigh (0,2,1) — an
 * unqualified light industry block would tie the dark base block and win on
 * source order, silently breaking dark mode. Qualifying every rule removes the
 * tie instead of relying on import order.
 *
 * Every rule also requires `body:has(.sina-wireframe)`, which is what keeps
 * `/showcase` on sage: the attribute may sit on <html> globally, but the
 * declarations only ever apply inside the landing.
 */
const themeSel = (theme) =>
  theme === "dark" ? 'html[data-theme="dark"]' : 'html:not([data-theme="dark"])';

const HEADER = `/*
 * PER-INDUSTRY TINT — GENERATED FILE, DO NOT EDIT BY HAND.
 *
 * Regenerate with \`node scripts/gen-industry-tints.mjs\`; the generator owns the
 * derivation and \`industry-tint.test.ts\` fails the build if this file drifts
 * from it or if a hand-edit breaks luminance parity across industries.
 *
 * Each industry is the sage anchor with ONLY its OKLCH hue replaced (fintech
 * ${"~"}133 sage, healthcare 250 clinical azure, defense 65 desert sand). Lightness
 * and chroma are identical across the three, so all three land within ~0.003
 * relative luminance of each other and every WCAG ratio holds for all of them.
 *
 * Raw hex is authored here on purpose. This is the third such exception on the
 * marketing side, alongside \`wireframe.css\` and \`GlyphField.module.css\` (the
 * glyph-field values in particular MUST stay literal hex — the WebGL canvas
 * parses them with \`parseColor\`, which understands only hex and rgb()).
 */
`;

const groups = [];
for (const theme of ["light", "dark"]) {
  for (const industry of Object.keys(INDUSTRIES)) {
    const decls = derive(industry, theme)
      .map(([n, v]) => `  ${n}: ${v};`)
      .join("\n");
    groups.push(
      `${themeSel(theme)}[data-industry="${industry}"] body:has(.sina-wireframe),\n` +
        `${themeSel(theme)}[data-industry="${industry}"] body:has(.sina-wireframe) .broadsheet {\n` +
        `${decls}\n}`,
    );
  }
}

export const css = `${HEADER}\n${groups.join("\n\n")}\n`;

if (import.meta.url === `file://${process.argv[1]}`) {
  writeFileSync(OUT, css);
  console.log(`wrote ${OUT.slice(REPO_ROOT.length + 1)} (${groups.length} blocks)`);
}
