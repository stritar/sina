// Canvas-2D renderer. Ported from repos/glyph-field/src/renderer.ts with one
// addition for the landing background: `draw()` takes a grid `origin` offset so
// the field can be SAMPLED at a scrolled position while still being DRAWN at
// on-screen cell coordinates. That is how the viewport-fixed canvas produces a
// background that scrolls with the page (origin.row = scrollY / cell) without
// ever redrawing more than a viewport of cells.
//
// The cursor probe readout is dropped (the preset sets probe: false).

import { Field, type Pointer } from "./field";
import { clamp, lerp, smoothstep } from "./noise";
import type { Params } from "./params";

export interface Dims {
  cssW: number;
  cssH: number;
  cols: number;
  rows: number;
  cell: number;
}

export interface Origin {
  /** Grid-cell offset added to sampled coords (col=x drift, row=y scroll). */
  col: number;
  row: number;
}

/** Fold an angle into [0, π) — glyph orientation is undirected (a tick, not an arrow). */
function foldHalf(theta: number): number {
  return ((theta % Math.PI) + Math.PI) % Math.PI;
}

export class Renderer {
  constructor(private ctx: CanvasRenderingContext2D) {}

  draw(
    field: Field,
    p: Params,
    t: number,
    dims: Dims,
    pointer: Pointer | null,
    origin: Origin = { col: 0, row: 0 },
  ): void {
    const ctx = this.ctx;
    const { cssW, cssH, cols, rows, cell } = dims;
    const fontPx = Math.max(4, Math.round(cell * 0.98));

    // Background (the field's opaque ground).
    ctx.fillStyle = p.background;
    ctx.fillRect(0, 0, cssW, cssH);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `${p.fontWeight} ${fontPx}px ${p.fontFamily}`;

    const dir = p.directionalChars || "─╱│╲";
    const blocks = p.blockChars || "█";
    const smooth = p.angleMode === "smooth";
    const buckets = p.angleMode === "8" ? 8 : 4;
    const accentCut = 1 - p.accentRatio;

    for (let row = 0; row < rows; row++) {
      const cy = row * cell + cell / 2;
      const gy = row + origin.row;
      for (let col = 0; col < cols; col++) {
        const c = field.sample(col + origin.col, gy, t, p, pointer);
        const v = c.v;

        let glyph: string;
        let alpha: number;
        let rotate = 0;

        if (v < p.blankThreshold) {
          // Sparse floor: fade the background dot out toward v = 0.
          if (!p.bgChar) continue;
          glyph = p.bgChar;
          alpha = lerp(0, p.minOpacity, v / (p.blankThreshold || 1e-6));
          if (alpha < 0.012) continue;
        } else if (v > p.blockThreshold) {
          // Dense clusters → block ramp.
          const k = smoothstep(p.blockThreshold, 1, v);
          glyph = blocks[Math.min(blocks.length - 1, Math.floor(k * blocks.length))] ?? "";
          alpha = lerp(0.65, 1, k);
        } else {
          // Mid band → directional flow ticks.
          if (smooth) {
            glyph = dir[0] ?? "";
            rotate = c.theta;
          } else {
            const idx = Math.round((foldHalf(c.theta) / Math.PI) * buckets) % buckets;
            glyph = dir[idx % dir.length] ?? "";
          }
          alpha = lerp(p.minOpacity, 1, smoothstep(p.blankThreshold, p.blockThreshold, v));
        }

        ctx.globalAlpha = clamp(alpha, 0, 1);
        ctx.fillStyle = c.accent > accentCut ? p.accentColor : p.primaryColor;

        const cx = col * cell + cell / 2;
        if (rotate !== 0) {
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(rotate);
          ctx.fillText(glyph, 0, 0);
          ctx.restore();
        } else {
          ctx.fillText(glyph, cx, cy);
        }
      }
    }

    ctx.globalAlpha = 1;
  }
}
