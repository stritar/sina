/**
 * SINA Tailwind preset.
 *
 * Phase 0: near-empty stub so both apps can wire `presets: [...]` now.
 * Phase 1 fills `theme.extend` from the design-token hand-off (color/spacing/
 * typography/radius scales + semantic tokens). Authored as CommonJS on purpose:
 * Tailwind loads this via require()/jiti, and the package's tsc build emits ESM —
 * keeping the preset out of the TS build graph makes it load deterministically.
 *
 * @type {import("tailwindcss").Config}
 */
module.exports = {
  theme: {
    extend: {},
  },
};
