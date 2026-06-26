import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const read = (rel: string) =>
  readFileSync(fileURLToPath(new URL(`../${rel}`, import.meta.url)), "utf8");

const themeCss = read("theme.css");
const tailwindPreset = read("tailwind.cjs");

/** Every `--sina-*` custom property declared in theme.css (`--sina-x: value;`). */
const declaredVars = new Set(
  [...themeCss.matchAll(/(--sina-[\w-]+)\s*:/g)].map((m) => m[1]),
);

/** Every `--sina-*` variable referenced by the Tailwind preset. */
const referencedVars = [
  ...tailwindPreset.matchAll(/var\((--sina-[\w-]+)/g),
].map((m) => m[1]);

describe("token drift — css ↔ tailwind preset", () => {
  it("declares at least the full token set", () => {
    expect(declaredVars.size).toBeGreaterThan(80);
  });

  it("every var the Tailwind preset references is declared in theme.css", () => {
    const missing = [...new Set(referencedVars)].filter(
      (name) => !declaredVars.has(name),
    );
    expect(missing).toEqual([]);
  });

  it("the preset overrides Tailwind defaults (strict, not extend-only)", () => {
    // colors/spacing/etc. live at theme root, not under theme.extend.
    expect(tailwindPreset).toMatch(/theme:\s*{[\s\S]*colors:/);
  });
});

/* ----------------------------------------------------------------------- */
/* Hex authoring rule — colors are written in hex, never channels/rgb/named */
/* (CLAUDE.md "Conventions"). Opacity comes from the preset's color-mix.    */
/* ----------------------------------------------------------------------- */

describe("color tokens are authored in hex", () => {
  it("every literal --sina-color-* / --sina-shadow-color value is #rrggbb(aa)", () => {
    const offenders = [
      ...themeCss.matchAll(
        /(--sina-(?:color-[\w-]+|shadow-color))\s*:\s*([^;]+);/g,
      ),
    ]
      .map(([, name, value]) => ({ name, value: value.trim() }))
      .filter(({ value }) => !value.startsWith("var(")) // aliases are references
      .filter(({ value }) => !/^#([0-9a-f]{6}|[0-9a-f]{8})$/i.test(value));

    expect(offenders).toEqual([]);
  });
});

/* ----------------------------------------------------------------------- */
/* WCAG 2.2 contrast — honoring the "Enforcing: WCAG-2.2" promise.         */
/* ----------------------------------------------------------------------- */

/** Read a semantic color role's RGB channels from theme.css (`#rrggbb`). */
function channels(role: string): [number, number, number] {
  const m = themeCss.match(
    new RegExp(`--sina-color-${role}:\\s*#([0-9a-fA-F]{6})\\b`),
  );
  if (!m) throw new Error(`no literal hex for --sina-color-${role}`);
  const hex = m[1];
  return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16)) as [
    number,
    number,
    number,
  ];
}

/** Relative luminance per WCAG 2.x. */
function luminance([r, g, b]: [number, number, number]): number {
  const lin = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function contrast(a: string, b: string): number {
  const la = luminance(channels(a));
  const lb = luminance(channels(b));
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

describe("WCAG 2.2 AA contrast (light theme)", () => {
  // Normal text ≥ 4.5:1
  it.each([
    ["text", "bg"],
    ["text", "surface"],
    ["text-muted", "bg"],
    ["text-muted", "surface"],
    ["primary-fg", "primary"],
    ["danger-fg", "danger"],
  ])("%s on %s meets AA (4.5:1)", (fg, bg) => {
    expect(contrast(fg, bg)).toBeGreaterThanOrEqual(4.5);
  });

  // Focus indicator must be perceivable (WCAG 2.2 §2.4.11/§2.4.13) ≥ 3:1.
  // (Decorative hairline borders are intentionally subtle and exempt.)
  it("focus-ring meets non-text contrast on bg (3:1)", () => {
    expect(contrast("focus-ring", "bg")).toBeGreaterThanOrEqual(3);
  });
});
