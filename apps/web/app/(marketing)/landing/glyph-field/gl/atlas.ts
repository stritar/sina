// Builds the glyph atlas: every glyph the field can draw, rendered white-on-
// transparent into one 2D canvas grid, ready to upload as a WebGL texture. The
// field pass emits an atlas INDEX per cell; the composite pass samples the tile.
//
// Tile order is fixed so the field shader's base/count uniforms line up:
//   [0] blank (transparent)  →  [bg?]  →  directionalChars…  →  blockChars…
// Coverage lives in the tile's alpha channel; color is applied in the shader.

import type { Params } from "../params";

/** Supersampled tile size in px — downscaled to the ~9px cell, so oversized. */
const TILE_PX = 32;
const TILES_PER_ROW = 16;

export interface Atlas {
  canvas: HTMLCanvasElement;
  tilePx: number;
  tilesPerRow: number;
  tileRows: number;
  /** Atlas index of the first directional glyph, and how many there are. */
  dirBase: number;
  dirCount: number;
  /** Atlas index of the first block glyph, and how many there are. */
  blockBase: number;
  blockCount: number;
  /** Atlas index of the sparse background glyph, or -1 when the preset has none. */
  bgIndex: number;
}

/**
 * Render the atlas for `params`. Resolution-independent (tiles are fixed-size
 * and downscaled at composite time), so this only needs rebuilding if the glyph
 * set or font changes — not on resize/DPR.
 */
export function buildAtlas(params: Params): Atlas {
  const dir = params.directionalChars || "─╱│╲";
  const blocks = params.blockChars || "█";
  const hasBg = params.bgChar.length > 0;

  // Assemble the ordered glyph list; index 0 stays blank/transparent.
  const glyphs: string[] = [""]; // [0] = blank
  const bgIndex = hasBg ? glyphs.push(params.bgChar) - 1 : -1;
  const dirBase = glyphs.length;
  for (const ch of dir) glyphs.push(ch);
  const dirCount = dir.length;
  const blockBase = glyphs.length;
  for (const ch of blocks) glyphs.push(ch);
  const blockCount = blocks.length;

  const count = glyphs.length;
  const tileRows = Math.ceil(count / TILES_PER_ROW);

  const canvas = document.createElement("canvas");
  canvas.width = TILES_PER_ROW * TILE_PX;
  canvas.height = tileRows * TILE_PX;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffffff"; // white coverage; color comes from the shader
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `${params.fontWeight} ${Math.round(TILE_PX * 0.82)}px ${params.fontFamily}`;
    for (let i = 1; i < count; i++) {
      const g = glyphs[i];
      if (!g || g === " ") continue; // blank / space tiles stay transparent
      const col = i % TILES_PER_ROW;
      const row = Math.floor(i / TILES_PER_ROW);
      ctx.fillText(g, col * TILE_PX + TILE_PX / 2, row * TILE_PX + TILE_PX / 2);
    }
  }

  return {
    canvas,
    tilePx: TILE_PX,
    tilesPerRow: TILES_PER_ROW,
    tileRows,
    dirBase,
    dirCount,
    blockBase,
    blockCount,
    bgIndex,
  };
}
