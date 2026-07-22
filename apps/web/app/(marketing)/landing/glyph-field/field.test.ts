import { describe, expect, it } from "vitest";
import { Field } from "./field";
import { SINA_GLYPH_FIELD } from "./params";

// Locks the ported render core: the field is a deterministic pure function of
// (seed + coords + time), so the shared seed reproduces the exact look, and the
// decoded preset stays wired to the values the user tuned.

const p = SINA_GLYPH_FIELD;

describe("glyph-field: Field.sample", () => {
  it("is deterministic for a given seed", () => {
    const a = new Field(p.seed);
    const b = new Field(p.seed);
    for (const [gx, gy, t] of [
      [0, 0, 0],
      [3, 5, 1.2],
      [-40, 120, 9.9],
    ] as const) {
      expect(a.sample(gx, gy, t, p, null)).toEqual(b.sample(gx, gy, t, p, null));
    }
  });

  it("keeps v within [0, 1] (including under pointer influence)", () => {
    const field = new Field(p.seed);
    const pointer = { col: 10, row: 10 };
    for (let gx = 0; gx < 40; gx++) {
      for (let gy = 0; gy < 40; gy++) {
        const { v, accent } = field.sample(gx, gy, 2.5, p, pointer);
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(1);
        expect(accent).toBeGreaterThanOrEqual(0);
        expect(accent).toBeLessThan(1);
      }
    }
  });

  it("different seeds diverge", () => {
    const a = new Field(p.seed).sample(7, 7, 3, p, null);
    const b = new Field(p.seed + 1).sample(7, 7, 3, p, null);
    expect(a).not.toEqual(b);
  });
});

describe("glyph-field: SINA preset", () => {
  it("matches the decoded permalink", () => {
    expect(p).toMatchObject({
      seed: 9361,
      cellSize: 9,
      drift: -7,
      turbulence: 2.9,
      timeSpeed: 0,
      blockChars: "#SINA123456",
      accentColor: "#C4C7C2",
      accentRatio: 0.165,
      pointerInfluence: 1.0,
      pointerRadius: 90,
    });
  });
});
