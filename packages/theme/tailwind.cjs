/**
 * SINA Tailwind preset.
 *
 * Maps Tailwind utilities onto the `--sina-*` CSS variables defined in
 * `theme.css` (the runtime source of truth) — so editing a token there
 * propagates to every utility in every app.
 *
 * Strict by design: the scales below OVERRIDE Tailwind's defaults (they are
 * not `extend`ed), so only on-system values exist — neither a developer nor an
 * AI agent can reach for an off-system `bg-red-500` or `p-7`. Tailwind's
 * structural utilities (flex/grid/position/…) are left untouched.
 *
 * Colors are consumed via `rgb(var(--sina-*) / <alpha-value>)` so opacity
 * modifiers (`bg-primary/50`) keep working. Authored as CommonJS on purpose:
 * Tailwind loads this via require()/jiti, and the package's tsc build emits ESM —
 * keeping the preset out of the TS build graph makes it load deterministically.
 *
 * @type {import("tailwindcss").Config}
 */

/** Build a color value that supports Tailwind's `<alpha-value>` opacity modifier. */
const c = (name) => `rgb(var(${name}) / <alpha-value>)`;

const ramp = (base) =>
  [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].reduce((acc, step) => {
    acc[step] = c(`--sina-color-${base}--${step}`);
    return acc;
  }, {});

const statusRamp = (base) =>
  [50, 100, 200, 300, 400, 500, 600, 700, 800, 900].reduce((acc, step) => {
    acc[step] = c(`--sina-color-${base}--${step}`);
    return acc;
  }, {});

module.exports = {
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    colors: {
      transparent: "transparent",
      current: "currentColor",
      inherit: "inherit",
      white: "rgb(255 255 255 / <alpha-value>)",
      black: "rgb(0 0 0 / <alpha-value>)",

      // Primitive ramps
      neutral: ramp("neutral"),
      brand: ramp("brand"),
      danger: {
        ...statusRamp("danger"),
        DEFAULT: c("--sina-color-danger"),
        fg: c("--sina-color-danger-fg"),
        bg: c("--sina-color-danger-bg"),
      },
      success: {
        ...statusRamp("success"),
        DEFAULT: c("--sina-color-success"),
        fg: c("--sina-color-success-fg"),
        bg: c("--sina-color-success-bg"),
      },
      warning: {
        ...statusRamp("warning"),
        DEFAULT: c("--sina-color-warning"),
        fg: c("--sina-color-warning-fg"),
        bg: c("--sina-color-warning-bg"),
      },
      info: {
        ...statusRamp("info"),
        DEFAULT: c("--sina-color-info"),
        fg: c("--sina-color-info-fg"),
        bg: c("--sina-color-info-bg"),
      },

      // Semantic roles
      bg: c("--sina-color-bg"),
      surface: {
        DEFAULT: c("--sina-color-surface"),
        raised: c("--sina-color-surface-raised"),
        sunken: c("--sina-color-surface-sunken"),
        secure: c("--sina-color-surface-secure"),
      },
      text: {
        DEFAULT: c("--sina-color-text"),
        muted: c("--sina-color-text-muted"),
        subtle: c("--sina-color-text-subtle"),
        inverse: c("--sina-color-text-inverse"),
      },
      border: {
        DEFAULT: c("--sina-color-border"),
        subtle: c("--sina-color-border-subtle"),
      },
      primary: {
        DEFAULT: c("--sina-color-primary"),
        hover: c("--sina-color-primary-hover"),
        fg: c("--sina-color-primary-fg"),
      },
      secondary: {
        DEFAULT: c("--sina-color-secondary"),
        hover: c("--sina-color-secondary-hover"),
        fg: c("--sina-color-secondary-fg"),
      },
      "focus-ring": c("--sina-color-focus-ring"),
      "intent-danger": c("--sina-color-intent-danger"),
      "intent-safe": c("--sina-color-intent-safe"),
    },

    spacing: {
      0: "var(--sina-space--0)",
      1: "var(--sina-space--1)",
      2: "var(--sina-space--2)",
      3: "var(--sina-space--3)",
      4: "var(--sina-space--4)",
      5: "var(--sina-space--5)",
      6: "var(--sina-space--6)",
      8: "var(--sina-space--8)",
      10: "var(--sina-space--10)",
      12: "var(--sina-space--12)",
      16: "var(--sina-space--16)",
      20: "var(--sina-space--20)",
      24: "var(--sina-space--24)",
    },

    borderRadius: {
      none: "var(--sina-radius--none)",
      xs: "var(--sina-radius--xs)",
      sm: "var(--sina-radius--sm)",
      md: "var(--sina-radius--md)",
      DEFAULT: "var(--sina-radius--lg)",
      lg: "var(--sina-radius--lg)",
      xl: "var(--sina-radius--xl)",
      "2xl": "var(--sina-radius--2xl)",
      full: "var(--sina-radius--full)",
    },

    fontFamily: {
      sans: "var(--sina-font--sans)",
      mono: "var(--sina-font--mono)",
    },

    fontSize: {
      xs: "var(--sina-text--xs)",
      sm: "var(--sina-text--sm)",
      base: "var(--sina-text--base)",
      lg: "var(--sina-text--lg)",
      xl: "var(--sina-text--xl)",
      "2xl": "var(--sina-text--2xl)",
      "3xl": "var(--sina-text--3xl)",
      "4xl": "var(--sina-text--4xl)",
      "5xl": "var(--sina-text--5xl)",
    },

    fontWeight: {
      normal: "var(--sina-font-weight--regular)",
      medium: "var(--sina-font-weight--medium)",
      semibold: "var(--sina-font-weight--semibold)",
      bold: "var(--sina-font-weight--bold)",
    },

    lineHeight: {
      none: "var(--sina-leading--none)",
      tight: "var(--sina-leading--tight)",
      snug: "var(--sina-leading--snug)",
      normal: "var(--sina-leading--normal)",
      relaxed: "var(--sina-leading--relaxed)",
    },

    letterSpacing: {
      tight: "var(--sina-tracking--tight)",
      normal: "var(--sina-tracking--normal)",
      wide: "var(--sina-tracking--wide)",
    },

    boxShadow: {
      none: "none",
      xs: "var(--sina-shadow--xs)",
      sm: "var(--sina-shadow--sm)",
      DEFAULT: "var(--sina-shadow--md)",
      md: "var(--sina-shadow--md)",
      lg: "var(--sina-shadow--lg)",
      xl: "var(--sina-shadow--xl)",
      focus: "var(--sina-shadow--focus)",
    },

    zIndex: {
      base: "var(--sina-z--base)",
      dropdown: "var(--sina-z--dropdown)",
      overlay: "var(--sina-z--overlay)",
      modal: "var(--sina-z--modal)",
      toast: "var(--sina-z--toast)",
    },

    // Media queries can't read CSS vars, so breakpoints are literal here
    // (mirrored in src/tokens.ts).
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },

    extend: {
      // Component sizing tokens (control heights / icon dims). Extended rather
      // than overridden so Tailwind's width/height keep auto/full/fractions.
      size: {
        "control-xs": "var(--sina-size--xs)",
        "control-sm": "var(--sina-size--sm)",
        "control-md": "var(--sina-size--md)",
        "control-lg": "var(--sina-size--lg)",
        "control-xl": "var(--sina-size--xl)",
      },
      transitionDuration: {
        fast: "var(--sina-duration--fast)",
        base: "var(--sina-duration--base)",
        slow: "var(--sina-duration--slow)",
      },
      transitionTimingFunction: {
        standard: "var(--sina-ease--standard)",
      },
    },
  },
};
