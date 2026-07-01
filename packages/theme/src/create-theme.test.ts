import { describe, expect, it } from "vitest";
import { colorTokens } from "./tokens.js";
import {
  brandColorTokens,
  createTheme,
  governanceLockedColorTokens,
  themeVars,
} from "./create-theme.js";

describe("theming contract partition", () => {
  it("brand-open + governance-locked exactly partition colorTokens (no drift)", () => {
    const contract = [
      ...Object.keys(brandColorTokens),
      ...Object.keys(governanceLockedColorTokens),
    ].sort();
    expect(contract).toEqual(Object.keys(colorTokens).sort());
  });

  it("brand-open and governance-locked never overlap", () => {
    const locked = new Set(Object.keys(governanceLockedColorTokens));
    expect(Object.keys(brandColorTokens).filter((k) => locked.has(k))).toEqual([]);
  });

  it("reserves the governance carve-outs (danger, secure surface, focus ring)", () => {
    expect(governanceLockedColorTokens).toMatchObject({
      danger: "--sina-color-danger",
      surfaceSecure: "--sina-color-surface-secure",
      focusRing: "--sina-color-focus-ring",
    });
  });
});

describe("createTheme", () => {
  it("emits a :root rule overriding brand-open vars by default", () => {
    const css = createTheme({ colors: { primary: "#7c3aed", primaryFg: "#ffffff" } });
    expect(css).toBe(
      ":root {\n  --sina-color-primary: #7c3aed;\n  --sina-color-primary-fg: #ffffff;\n}",
    );
  });

  it("scopes to a named brand selector", () => {
    const css = createTheme(
      { colors: { primary: "#7c3aed" } },
      { selector: '[data-theme="acme"]' },
    );
    expect(css.startsWith('[data-theme="acme"] {')).toBe(true);
  });

  it("maps radius/space/text/font to the right var names (decimal space → _)", () => {
    const css = createTheme({
      radius: { md: "4px" },
      space: { 2.5: "9px" },
      text: { "2xl": "1.6rem" },
      font: { sans: "Inter, sans-serif" },
    });
    expect(css).toContain("--sina-radius--md: 4px;");
    expect(css).toContain("--sina-space--2_5: 9px;");
    expect(css).toContain("--sina-text--2xl: 1.6rem;");
    expect(css).toContain("--sina-font--sans: Inter, sans-serif;");
  });
});

describe("themeVars", () => {
  it("returns an inline-style object of var overrides", () => {
    expect(themeVars({ colors: { primary: "#7c3aed" }, radius: { md: "4px" } })).toEqual({
      "--sina-color-primary": "#7c3aed",
      "--sina-radius--md": "4px",
    });
  });
});
