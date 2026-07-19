// Seeded simplex noise + fBm + math helpers. Ported verbatim from the
// standalone glyph-field project (repos/glyph-field/src/noise.ts). Framework-
// and DOM-free; the only runtime dependency is `simplex-noise`.

import { createNoise3D } from "simplex-noise";

// --- small math helpers (this module doubles as the "math" layer) ---

export const clamp = (x: number, lo: number, hi: number): number =>
  x < lo ? lo : x > hi ? hi : x;

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0 || 1e-6), 0, 1);
  return t * t * (3 - 2 * t);
}

// --- seeded PRNG so a given `seed` reproduces the exact field ---

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Noise3D = (x: number, y: number, z: number) => number;

/** A simplex noise instance seeded deterministically from `seed`. */
export function makeNoise(seed: number): Noise3D {
  return createNoise3D(mulberry32(seed));
}

/** Fractal Brownian motion (summed octaves). Returns roughly [-1, 1]. */
export function fbm(
  noise: Noise3D,
  x: number,
  y: number,
  z: number,
  octaves: number,
): number {
  let sum = 0;
  let amp = 0.5;
  let freq = 1;
  let norm = 0;
  const n = Math.max(1, octaves | 0);
  for (let i = 0; i < n; i++) {
    sum += amp * noise(x * freq, y * freq, z * freq);
    norm += amp;
    amp *= 0.5;
    freq *= 2;
  }
  return sum / (norm || 1);
}
