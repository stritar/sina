import { describe, expect, it } from "vitest";
import { parseColor } from "./color";

// The GPU path feeds `--sina-glyphfield-*` into vec3 uniforms, but those values
// reach us via getComputedStyle — which may hand back hex (custom-property
// literal) OR rgb()/rgba() (normalized). Both must parse; anything else must
// degrade to the supplied fallback rather than poison a uniform.

describe("glyph-field: parseColor", () => {
  it("parses 6-digit hex", () => {
    expect(parseColor("#ffffff")).toEqual([1, 1, 1]);
    expect(parseColor("#000000")).toEqual([0, 0, 0]);
    const [r, g, b] = parseColor("#f5f6f4");
    expect(r).toBeCloseTo(245 / 255);
    expect(g).toBeCloseTo(246 / 255);
    expect(b).toBeCloseTo(244 / 255);
  });

  it("parses shorthand hex and ignores hex alpha", () => {
    expect(parseColor("#fff")).toEqual([1, 1, 1]);
    expect(parseColor("#ff0000ff")).toEqual([1, 0, 0]);
  });

  it("parses rgb() and rgba(), comma or space syntax", () => {
    expect(parseColor("rgb(255, 0, 0)")).toEqual([1, 0, 0]);
    expect(parseColor("rgba(0, 128, 255, 0.5)")).toEqual([0, 128 / 255, 1]);
    expect(parseColor("rgb(255 255 255 / 80%)")).toEqual([1, 1, 1]);
  });

  it("falls back on empty or unrecognized input", () => {
    const fb: [number, number, number] = [0.1, 0.2, 0.3];
    expect(parseColor("", fb)).toBe(fb);
    expect(parseColor("   ", fb)).toBe(fb);
    expect(parseColor("chartreuse", fb)).toBe(fb);
    expect(parseColor("#zzz", fb)).toBe(fb);
  });
});
