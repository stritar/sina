// The tunable state of the glyph field, ported from repos/glyph-field/src/
// params.ts. `SINA_GLYPH_FIELD` is the exact preset the user tuned (decoded
// from the shared `#p=` permalink). The three colors here are light-mode
// placeholders — GlyphField.tsx overrides them at runtime from the
// `--sina-glyphfield-*` CSS variables so the field follows light/dark.

export type AngleMode = "4" | "8" | "smooth";

export interface Params {
  // --- Field & motion ---
  /** Spatial frequency of the flow-angle field (bigger = tighter swirls). */
  flowScale: number;
  /** Spatial frequency of the value/density field (smaller = larger regions). */
  densityScale: number;
  /** Animation speed (rate the noise evolves in time). */
  timeSpeed: number;
  /** How many half-turns the flow angle spans (swirliness). */
  turbulence: number;
  /** Domain-warp amount — feeds noise through noise for organic structure. */
  warp: number;
  /** fBm octaves (detail). */
  octaves: number;
  /** Horizontal scroll bias, in cells/sec-ish. */
  drift: number;
  /** PRNG seed — same seed reproduces the exact field. */
  seed: number;

  // --- Grid & glyphs ---
  /** CSS px per cell (grid resolution). */
  cellSize: number;
  fontFamily: string;
  fontWeight: number;
  /** 4/8 angle buckets into `directionalChars`, or continuous rotation. */
  angleMode: AngleMode;
  /** Ordered glyphs indexed by flow angle, e.g. "─╱│╲". */
  directionalChars: string;
  /** Dense-region glyphs, sparse→full, e.g. "▪■█". */
  blockChars: string;
  /** Sparse background dot for the low-value floor. */
  bgChar: string;

  // --- Tone ---
  background: string;
  primaryColor: string;
  accentColor: string;
  /** Fraction of cells flipped to the accent color (0..1). */
  accentRatio: number;
  /** Value below this → background floor / blank. */
  blankThreshold: number;
  /** Value above this → block glyph (the rectangular clusters). */
  blockThreshold: number;
  /** Alpha floor for the faintest drawn cell. */
  minOpacity: number;

  // --- Interaction ---
  /** Strength of the cursor's perturbation of the field. */
  pointerInfluence: number;
  /** Radius (CSS px) of the cursor's influence. */
  pointerRadius: number;
}

/** The port's baseline. `SINA_GLYPH_FIELD` is a partial merged over this. */
const defaultParams: Params = {
  flowScale: 0.062,
  densityScale: 0.024,
  timeSpeed: 0.12,
  turbulence: 1.45,
  warp: 0.35,
  octaves: 3,
  drift: 0.0,
  seed: 7,
  cellSize: 12,
  fontFamily: 'ui-monospace, "SF Mono", "JetBrains Mono", Menlo, Consolas, monospace',
  fontWeight: 500,
  angleMode: "4",
  directionalChars: "─╱│╲",
  blockChars: "▪▬■█",
  bgChar: "·",
  background: "#f1f0ea",
  primaryColor: "#2b34e0",
  accentColor: "#15151c",
  accentRatio: 0.06,
  blankThreshold: 0.34,
  blockThreshold: 0.68,
  minOpacity: 0.14,
  pointerInfluence: 0.55,
  pointerRadius: 130,
};

/** Merge a partial (preset / permalink) over the defaults. */
export function withDefaults(partial: Partial<Params>): Params {
  return { ...defaultParams, ...partial };
}

/**
 * The SINA landing preset — the exact look the user shared. Colors are the
 * light-mode values; the component swaps them from CSS per theme.
 */
export const SINA_GLYPH_FIELD: Params = withDefaults({
  flowScale: 0.045,
  densityScale: 0.041,
  timeSpeed: 0,
  turbulence: 2.9,
  warp: 1.05,
  octaves: 2,
  drift: -7,
  seed: 9361,
  cellSize: 9,
  fontWeight: 200,
  directionalChars: ". : -*^{",
  blockChars: "#SINA123456",
  bgChar: "",
  background: "#f5f6f4",
  primaryColor: "#D7DBD2",
  accentColor: "#C4C7C2",
  accentRatio: 0.165,
  blankThreshold: 0,
  blockThreshold: 0.67,
  pointerInfluence: 1.0,
  pointerRadius: 90,
});
