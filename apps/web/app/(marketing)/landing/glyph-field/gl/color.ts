// Parse a CSS color string into a normalized linear-agnostic RGB triple in
// [0, 1] for use as a WebGL `vec3` uniform.
//
// The GPU path needs float channels, but the `--sina-glyphfield-*` tokens reach
// us through `getComputedStyle`, which normalizes colors to `rgb(...)` /
// `rgba(...)` — NOT the authored hex. So both forms must parse. (The Canvas-2D
// fallback sidesteps this entirely by handing the raw string to `fillStyle`.)

export type RGB = readonly [number, number, number];

function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

/** `#rgb` / `#rgba` / `#rrggbb` / `#rrggbbaa` → RGB, or null if not hex. */
function parseHex(hex: string): RGB | null {
  let h = hex.slice(1);
  if (h.length === 3 || h.length === 4) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (h.length !== 6 && h.length !== 8) return null;
  const int = Number.parseInt(h.slice(0, 6), 16);
  if (Number.isNaN(int)) return null;
  return [((int >> 16) & 0xff) / 255, ((int >> 8) & 0xff) / 255, (int & 0xff) / 255];
}

/** `rgb(r, g, b)` / `rgba(r g b / a)` (comma or space syntax) → RGB, or null. */
function parseRgb(str: string): RGB | null {
  const open = str.indexOf("(");
  const close = str.indexOf(")");
  if (open < 0 || close < 0) return null;
  // Split on commas or whitespace; drop an alpha slash and anything after it.
  const inner = str.slice(open + 1, close).split("/")[0] ?? "";
  const parts = inner
    .trim()
    .split(/[\s,]+/)
    .filter(Boolean)
    .slice(0, 3)
    .map((tok) =>
      tok.endsWith("%") ? (Number.parseFloat(tok) / 100) * 255 : Number.parseFloat(tok),
    );
  if (parts.length < 3 || parts.some((n) => Number.isNaN(n))) return null;
  const [r, g, b] = parts as [number, number, number];
  return [clamp01(r / 255), clamp01(g / 255), clamp01(b / 255)];
}

/**
 * Parse `value` into an RGB triple in [0, 1]. Handles hex and `rgb()/rgba()`
 * (the two forms the glyph-field ever sees). Returns `fallback` on anything
 * unrecognized so a bad/empty computed value never poisons a uniform.
 */
export function parseColor(value: string, fallback: RGB = [0, 0, 0]): RGB {
  const v = value.trim().toLowerCase();
  if (!v) return fallback;
  if (v.startsWith("#")) return parseHex(v) ?? fallback;
  if (v.startsWith("rgb")) return parseRgb(v) ?? fallback;
  return fallback;
}
