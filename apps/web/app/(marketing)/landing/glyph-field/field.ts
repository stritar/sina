// The per-cell field math. Ported verbatim from the standalone glyph-field
// project (repos/glyph-field/src/field.ts). Pure function of params + seed +
// grid coords + time (+ optional pointer); no DOM access.

import { fbm, makeNoise, type Noise3D, clamp, smoothstep } from "./noise";
import type { Params } from "./params";

/** Integer hash → uniform [0, 1). Used for the accent channel. */
function hash2(x: number, y: number): number {
  let h = (Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

export interface Pointer {
  /** Cursor position in grid/cell units (px / cellSize). */
  col: number;
  row: number;
}

export interface Cell {
  /** Scalar value in [0, 1] — drives glyph ramp and opacity. */
  v: number;
  /** Flow direction in radians. */
  theta: number;
  /** Accent noise in [0, 1] — cells above (1 - accentRatio) render as accent. */
  accent: number;
}

/**
 * Samples the two fields that define the look at each grid cell:
 *   - a low-frequency scalar `v` (the drifting banded/blocky structure), and
 *   - a flow angle `theta` (the direction each glyph points).
 * Four decorrelated noise instances are rebuilt whenever the seed changes.
 */
export class Field {
  private flow!: Noise3D;
  private density!: Noise3D;
  private warp!: Noise3D;
  private accentNoise!: Noise3D;

  constructor(seed: number) {
    this.reseed(seed);
  }

  reseed(seed: number): void {
    this.flow = makeNoise(seed);
    this.density = makeNoise(seed + 101);
    this.warp = makeNoise(seed + 202);
    this.accentNoise = makeNoise(seed + 303);
  }

  sample(gx: number, gy: number, t: number, p: Params, pointer: Pointer | null): Cell {
    const tv = t * p.timeSpeed;
    const ox = p.drift * t; // scroll bias along x

    // Domain warp: offset the sample coordinates by a slow noise field.
    let wx = 0;
    let wy = 0;
    if (p.warp > 0) {
      wx = p.warp * this.warp((gx + 31) * p.densityScale, (gy + 17) * p.densityScale, tv);
      wy = p.warp * this.warp((gx - 23) * p.densityScale, (gy + 41) * p.densityScale, tv);
    }

    // Value / density field (low frequency → large regions).
    const dfx = (gx + ox) * p.densityScale + wx;
    const dfy = gy * p.densityScale + wy;
    let v = 0.5 + 0.5 * fbm(this.density, dfx, dfy, tv * 0.6, p.octaves);

    // Flow angle (higher frequency → the flowing tick texture).
    const ffx = (gx + ox) * p.flowScale + wx;
    const ffy = gy * p.flowScale + wy;
    const a = 0.5 + 0.5 * fbm(this.flow, ffx, ffy, tv, p.octaves); // [0,1]
    let theta = a * Math.PI * p.turbulence;

    // Accent channel — a per-cell uniform hash drifted by a slow field. Because
    // (uniform + anything) mod 1 stays uniform, `accentRatio` maps to the real
    // fraction of accented cells (renderer accents when accent > 1 - ratio),
    // while the smooth term makes the accents drift over space and time.
    let accent = hash2(gx, gy) + 0.5 * this.accentNoise(gx * 0.1, gy * 0.1, tv * 0.5);
    accent -= Math.floor(accent);

    // Pointer influence: brighten + swirl the field near the cursor.
    if (pointer && p.pointerInfluence > 0) {
      const dx = gx - pointer.col;
      const dy = gy - pointer.row;
      const radiusCells = Math.max(1, p.pointerRadius / p.cellSize);
      const f = 1 - smoothstep(0, radiusCells, Math.hypot(dx, dy));
      if (f > 0) {
        v += f * p.pointerInfluence * 0.45;
        theta += f * p.pointerInfluence * Math.atan2(dy, dx); // curl around the cursor
      }
    }

    return { v: clamp(v, 0, 1), theta, accent };
  }
}
