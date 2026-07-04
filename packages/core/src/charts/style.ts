/**
 * @sina-design-system/core — charts/style (internal)
 *
 * Token readers for canvas charts. Chart.js paints raw values, not CSS classes,
 * so these read the `--sina-*` custom properties at render time — scoped to the
 * chart's own container element (custom properties inherit, so a `.dark` wrapper
 * or a `themeVars()` brand scope re-themes just that chart). SSR-guarded: on the
 * server every reader returns its fallback; chart components only build options
 * after their container ref mounts, so no server render ever paints a fallback.
 */

export type SinaVar = `--sina-${string}`;

function readVar(el: Element | null, name: SinaVar): string {
  if (typeof window === "undefined" || typeof document === "undefined") return "";
  const target = el ?? document.documentElement;
  return getComputedStyle(target).getPropertyValue(name).trim();
}

/** Read a token's raw value, falling back when unset (SSR, jsdom, missing theme). */
export function getStyle(el: Element | null, name: SinaVar, fallback: string): string {
  return readVar(el, name) || fallback;
}

const UNITLESS = /^-?\d*\.?\d+$/;

/**
 * Convert a CSS length to a number Chart.js can use: `"13px"` → 13,
 * `"0.75rem"` → rem × root font size, `"500"` → 500. Anything else → undefined.
 */
export function toPx(raw: string, rootFontSize: number): number | undefined {
  if (!raw) return undefined;
  const value = Number.parseFloat(raw);
  if (Number.isNaN(value)) return undefined;
  if (raw.endsWith("rem")) return value * rootFontSize;
  if (raw.endsWith("px")) return value;
  if (UNITLESS.test(raw)) return value;
  return undefined;
}

/** Read a token as a px/unitless number (Chart.js wants numbers, not CSS units). */
export function getStyleNumber(el: Element | null, name: SinaVar, fallback: string): number {
  const raw = readVar(el, name) || fallback;
  const rootFontSize =
    typeof document === "undefined"
      ? 16
      : Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  return toPx(raw, rootFontSize) ?? toPx(fallback, rootFontSize) ?? 0;
}
