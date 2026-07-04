/**
 * @sina-design-system/theme — the theming contract (brand-open vs governance-locked)
 *
 * SINA primitives are rebranded by reassigning `--sina-*` CSS variables, never by
 * editing the primitives (dark mode in `theme.css` is the same mechanism). This
 * module is the *typed, sanctioned* path for that:
 *   - `brandColorTokens` — the semantic color roles a consumer MAY rebrand.
 *   - `governanceLockedColorTokens` — roles SINA reserves (danger / secure surface /
 *     focus ring / intent aliases): excluded from `BrandTheme`, so `createTheme`
 *     rejects them at compile time. Raw CSS can still force them by specificity —
 *     but the supported API will not, so a theme can't silently neuter a security
 *     or accessibility affordance.
 *   - `createTheme(theme, { selector })` — emit a scoped CSS rule overriding the
 *     brand-open vars. Ship it in a global stylesheet or a <style> tag.
 *   - `themeVars(theme)` — the same overrides as an inline-style object for React
 *     `style={}` / CSS-in-JS. Returns a plain record — no React import (boundary-safe).
 *
 * No React — tokens only. Colors flow through `color-mix(var(--sina-*) …)` in the
 * Tailwind preset, so a hex override here keeps opacity modifiers (`bg-primary/50`)
 * working unchanged.
 */

import { colorTokens, fontFamily, fontSize, radius, space } from "./tokens.js";

/**
 * Semantic color roles a consumer may rebrand. Override fg/bg as *pairs* so they
 * stay AA-legible. Status roles (success/warning/info) are brand-open but carry
 * meaning — keep them recognizable.
 */
export const brandColorTokens = {
  bg: colorTokens.bg,
  surface: colorTokens.surface,
  surfaceRaised: colorTokens.surfaceRaised,
  surfaceSunken: colorTokens.surfaceSunken,
  text: colorTokens.text,
  textMuted: colorTokens.textMuted,
  textSubtle: colorTokens.textSubtle,
  textInverse: colorTokens.textInverse,
  border: colorTokens.border,
  borderSubtle: colorTokens.borderSubtle,
  primary: colorTokens.primary,
  primaryHover: colorTokens.primaryHover,
  primaryActive: colorTokens.primaryActive,
  primaryFg: colorTokens.primaryFg,
  secondary: colorTokens.secondary,
  secondaryHover: colorTokens.secondaryHover,
  secondaryFg: colorTokens.secondaryFg,
  success: colorTokens.success,
  successFg: colorTokens.successFg,
  successBg: colorTokens.successBg,
  warning: colorTokens.warning,
  warningFg: colorTokens.warningFg,
  warningBg: colorTokens.warningBg,
  info: colorTokens.info,
  infoFg: colorTokens.infoFg,
  infoBg: colorTokens.infoBg,
  // Dataviz series palette is brand-open: a consumer may rebrand its chart
  // colors, but must preserve the fixed slot order contract (see theme.css).
  chart1: colorTokens.chart1,
  chart2: colorTokens.chart2,
  chart3: colorTokens.chart3,
  chart4: colorTokens.chart4,
  chart5: colorTokens.chart5,
  chart6: colorTokens.chart6,
  chart7: colorTokens.chart7,
  chart8: colorTokens.chart8,
} as const satisfies Record<string, `--sina-${string}`>;

/**
 * Governance-reserved color roles — NOT part of `BrandTheme`.
 * `danger*` is the "never quieted" carve-out; `surface-secure` is the secure-surface
 * signal; `focus-ring` is the keyboard-operability a11y hook; the `intent-*` aliases
 * carry governance meaning. Rebranding these would neuter a security or accessibility
 * affordance, so the typed API refuses them. Exported for docs + the partition guard.
 */
export const governanceLockedColorTokens = {
  danger: colorTokens.danger,
  dangerFg: colorTokens.dangerFg,
  dangerBg: colorTokens.dangerBg,
  surfaceSecure: colorTokens.surfaceSecure,
  focusRing: colorTokens.focusRing,
  intentDanger: colorTokens.intentDanger,
  intentSafe: colorTokens.intentSafe,
} as const satisfies Record<string, `--sina-${string}`>;

export type BrandColorRole = keyof typeof brandColorTokens;
export type RadiusStep = keyof typeof radius;
export type SpaceStep = keyof typeof space;
export type TextStep = keyof typeof fontSize;
export type FontFamilyRole = keyof typeof fontFamily;

/** A consumer brand theme. Only brand-open tokens are reachable — locked roles won't type. */
export interface BrandTheme {
  /** Semantic color roles → any CSS color (hex recommended; opacity modifiers still work). */
  colors?: Partial<Record<BrandColorRole, string>>;
  /** Corner radii → any CSS length (e.g. `"4px"`, `"0.5rem"`). */
  radius?: Partial<Record<RadiusStep, string>>;
  /** Spacing steps → any CSS length. */
  space?: Partial<Record<SpaceStep, string>>;
  /** Type scale → any CSS length. */
  text?: Partial<Record<TextStep, string>>;
  /** Font stacks → any CSS `font-family` value. */
  font?: Partial<Record<FontFamilyRole, string>>;
}

export interface CreateThemeOptions {
  /**
   * CSS selector to scope the overrides to. Default `":root"`.
   * Use `'[data-theme="acme"]'` to scope a named brand (composes with dark mode).
   */
  selector?: string;
}

/**
 * Flatten a `BrandTheme` to `[cssVarName, value]` pairs. Space decimals map to `_`
 * (0.5 → `--sina-space--0_5`), matching `theme.css`.
 */
function declarations(theme: BrandTheme): Array<[string, string]> {
  const out: Array<[string, string]> = [];
  const push = (name: string, value: string | undefined) => {
    if (value !== undefined) out.push([name, value]);
  };
  for (const [role, value] of Object.entries(theme.colors ?? {})) {
    push(brandColorTokens[role as BrandColorRole], value);
  }
  for (const [step, value] of Object.entries(theme.radius ?? {})) {
    push(`--sina-radius--${step}`, value);
  }
  for (const [step, value] of Object.entries(theme.space ?? {})) {
    push(`--sina-space--${step.replace(".", "_")}`, value);
  }
  for (const [step, value] of Object.entries(theme.text ?? {})) {
    push(`--sina-text--${step}`, value);
  }
  for (const [role, value] of Object.entries(theme.font ?? {})) {
    push(`--sina-font--${role}`, value);
  }
  return out;
}

/** Emit a scoped CSS rule that rebrands the brand-open tokens. */
export function createTheme(theme: BrandTheme, options: CreateThemeOptions = {}): string {
  const selector = options.selector ?? ":root";
  const body = declarations(theme)
    .map(([name, value]) => `  ${name}: ${value};`)
    .join("\n");
  return `${selector} {\n${body}\n}`;
}

/**
 * The same overrides as an inline-style object
 * (`{ "--sina-color-primary": "#7c3aed" }`) for React `style={}` / CSS-in-JS.
 * Put it on a wrapping element to scope the brand.
 */
export function themeVars(theme: BrandTheme): Record<string, string> {
  return Object.fromEntries(declarations(theme));
}
