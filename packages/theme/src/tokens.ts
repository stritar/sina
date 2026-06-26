/**
 * SINA design tokens — typed JS/TS surface.
 *
 * The runtime source of truth is `theme.css` (the `--sina-*` CSS variables);
 * this module exposes the same tokens to JS/TS consumers as:
 *   - `cssVar()` — build a `var(--sina-*)` / `rgb(var(--sina-*) / a)` reference,
 *   - `colorTokens` — the semantic color var names (theme-aware at runtime),
 *   - scalar scales (`space`, `fontSize`, `radius`, `size`, …) for programmatic use.
 *
 * Prefer referencing tokens by var (theme-aware, dark-mode-safe) over hardcoding
 * the raw scalars. No React — tokens only.
 */

/** Reference a SINA CSS variable. Pass `alpha` for color channels. */
export function cssVar(name: `--sina-${string}`, alpha?: number): string {
  return alpha === undefined ? `var(${name})` : `rgb(var(${name}) / ${alpha})`;
}

/** Semantic color roles → their CSS variable names. */
export const colorTokens = {
  bg: "--sina-color-bg",
  surface: "--sina-color-surface",
  surfaceRaised: "--sina-color-surface-raised",
  surfaceSunken: "--sina-color-surface-sunken",
  surfaceSecure: "--sina-color-surface-secure",
  text: "--sina-color-text",
  textMuted: "--sina-color-text-muted",
  textSubtle: "--sina-color-text-subtle",
  textInverse: "--sina-color-text-inverse",
  border: "--sina-color-border",
  borderSubtle: "--sina-color-border-subtle",
  primary: "--sina-color-primary",
  primaryHover: "--sina-color-primary-hover",
  primaryFg: "--sina-color-primary-fg",
  secondary: "--sina-color-secondary",
  secondaryHover: "--sina-color-secondary-hover",
  secondaryFg: "--sina-color-secondary-fg",
  danger: "--sina-color-danger",
  dangerFg: "--sina-color-danger-fg",
  dangerBg: "--sina-color-danger-bg",
  success: "--sina-color-success",
  successFg: "--sina-color-success-fg",
  successBg: "--sina-color-success-bg",
  warning: "--sina-color-warning",
  warningFg: "--sina-color-warning-fg",
  warningBg: "--sina-color-warning-bg",
  info: "--sina-color-info",
  infoFg: "--sina-color-info-fg",
  infoBg: "--sina-color-info-bg",
  focusRing: "--sina-color-focus-ring",
  intentDanger: "--sina-color-intent-danger",
  intentSafe: "--sina-color-intent-safe",
} as const satisfies Record<string, `--sina-${string}`>;

/** Font families. */
export const fontFamily = {
  sans: "--sina-font--sans",
  mono: "--sina-font--mono",
} as const satisfies Record<string, `--sina-${string}`>;

/** Type scale (t-shirt) → pixel size, for layout math. */
export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  "2xl": 24,
  "3xl": 30,
  "4xl": 36,
  "5xl": 40,
} as const;

export const fontWeight = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

export const lineHeight = {
  none: 1,
  tight: 1.1,
  snug: 1.3,
  normal: 1.5,
  relaxed: 1.7,
} as const;

/** Spacing — 8pt grid (4px base), step → pixels. */
export const space = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
} as const;

/** Border radius (t-shirt) → pixels. */
export const radius = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
  "2xl": 16,
  full: 9999,
} as const;

/** Control / icon sizing (t-shirt) → pixels. */
export const size = {
  xs: 16,
  sm: 24,
  md: 32,
  lg: 40,
  xl: 48,
} as const;

/** Breakpoints → pixels (mirrored from tailwind.cjs `screens`). */
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

export const zIndex = {
  base: 0,
  dropdown: 1000,
  overlay: 1300,
  modal: 1400,
  toast: 1600,
} as const;

export const duration = {
  fast: 120,
  base: 200,
  slow: 320,
} as const;
