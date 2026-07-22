// The WebGL2 renderer for the glyph-field: a two-pass GPU pipeline that replaces
// the per-frame CPU canvas repaint. Pass 1 computes the field at cell resolution
// into an offscreen RGBA8 texture; pass 2 composites glyphs from the atlas over
// the background at device resolution. Per frame it issues two draw calls and a
// handful of uniform writes — the main thread stays idle.
//
// Resource ownership: this class creates/deletes its programs, VAO, atlas
// texture, field texture, and FBO. WebGL context loss is handled one level up in
// GlyphField.tsx, which disposes and rebuilds a fresh renderer on restore.

import type { Params } from "../params";
import type { Dims } from "../renderer";
import type { Atlas } from "./atlas";
import type { RGB } from "./color";
import { FULLSCREEN_VERT, FIELD_FRAG, COMPOSITE_FRAG } from "./glsl";
import { mulberry32 } from "../noise";

/** Cursor in bottom-up cell units (matches the shader's coordinate space). */
export interface GLPointer {
  col: number;
  row: number;
}

type Offsets = {
  flow: [number, number, number];
  density: [number, number, number];
  warp: [number, number, number];
  accent: [number, number, number];
};

/** Decorrelate the four noise "instances" the JS field seeded separately. */
function seedOffsets(seed: number): Offsets {
  const off = (salt: number): [number, number, number] => {
    const r = mulberry32((seed + salt) >>> 0);
    return [(r() - 0.5) * 1024, (r() - 0.5) * 1024, (r() - 0.5) * 1024];
  };
  return { flow: off(0), density: off(101), warp: off(202), accent: off(303) };
}

function compile(gl: WebGL2RenderingContext, type: number, src: string): WebGLShader {
  const sh = gl.createShader(type);
  if (!sh) throw new Error("glyph-field: createShader failed");
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(sh);
    gl.deleteShader(sh);
    throw new Error(`glyph-field: shader compile failed: ${log}`);
  }
  return sh;
}

function link(gl: WebGL2RenderingContext, vs: WebGLShader, fs: WebGLShader): WebGLProgram {
  const p = gl.createProgram();
  if (!p) throw new Error("glyph-field: createProgram failed");
  gl.attachShader(p, vs);
  gl.attachShader(p, fs);
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(p);
    gl.deleteProgram(p);
    throw new Error(`glyph-field: program link failed: ${log}`);
  }
  return p;
}

// Deriving the key set from an `as const` array gives a concrete-keyed Record
// (no index signature), so `u.uTime` is `WebGLUniformLocation | null` — not
// `| undefined` under the repo's noUncheckedIndexedAccess.
function uniforms<N extends string>(
  gl: WebGL2RenderingContext,
  prog: WebGLProgram,
  names: readonly N[],
): Record<N, WebGLUniformLocation | null> {
  const map = {} as Record<N, WebGLUniformLocation | null>;
  for (const n of names) map[n] = gl.getUniformLocation(prog, n);
  return map;
}

const FIELD_UNIFORMS = [
  "uTime", "uFlowScale", "uDensityScale", "uTimeSpeed", "uTurbulence", "uWarp",
  "uDrift", "uOctaves", "uAccentRatio", "uBlankThreshold", "uBlockThreshold",
  "uMinOpacity", "uCellSize", "uPointerInfluence", "uPointerRadius",
  "uPointerActive", "uPointer", "uDirBase", "uDirCount", "uBlockBase",
  "uBlockCount", "uBgIndex", "uBuckets", "uOffFlow", "uOffDensity", "uOffWarp",
  "uOffAccent",
] as const;
const COMPOSITE_UNIFORMS = [
  "uField", "uAtlas", "uResolution", "uDpr", "uCellPx", "uGrid", "uAtlasTiles",
  "uBg", "uPrimary", "uAccent",
] as const;

export class GLRenderer {
  private gl: WebGL2RenderingContext;
  private params: Params;
  private offsets: Offsets;

  private vs: WebGLShader;
  private fieldProg: WebGLProgram;
  private compositeProg: WebGLProgram;
  private fieldU: Record<(typeof FIELD_UNIFORMS)[number], WebGLUniformLocation | null>;
  private compositeU: Record<(typeof COMPOSITE_UNIFORMS)[number], WebGLUniformLocation | null>;
  private vao: WebGLVertexArrayObject | null;

  private atlas: Atlas | null = null;
  private atlasTex: WebGLTexture | null = null;
  private fieldTex: WebGLTexture | null = null;
  private fbo: WebGLFramebuffer | null = null;

  private dims: Dims | null = null;
  private dpr = 1;
  private bg: RGB = [0, 0, 0];
  private primary: RGB = [0, 0, 0];
  private accent: RGB = [0, 0, 0];

  constructor(gl: WebGL2RenderingContext, params: Params) {
    this.gl = gl;
    this.params = params;
    this.offsets = seedOffsets(params.seed);

    this.vs = compile(gl, gl.VERTEX_SHADER, FULLSCREEN_VERT);
    const fieldFs = compile(gl, gl.FRAGMENT_SHADER, FIELD_FRAG);
    const compositeFs = compile(gl, gl.FRAGMENT_SHADER, COMPOSITE_FRAG);
    this.fieldProg = link(gl, this.vs, fieldFs);
    this.compositeProg = link(gl, this.vs, compositeFs);
    gl.deleteShader(fieldFs);
    gl.deleteShader(compositeFs);
    this.fieldU = uniforms(gl, this.fieldProg, FIELD_UNIFORMS);
    this.compositeU = uniforms(gl, this.compositeProg, COMPOSITE_UNIFORMS);

    this.vao = gl.createVertexArray();
  }

  setColors(bg: RGB, primary: RGB, accent: RGB): void {
    this.bg = bg;
    this.primary = primary;
    this.accent = accent;
  }

  setAtlas(atlas: Atlas): void {
    const gl = this.gl;
    this.atlas = atlas;
    if (!this.atlasTex) this.atlasTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.atlasTex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlas.canvas);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }

  /**
   * Store the current grid/DPR and, only when cols×rows actually change,
   * (re)allocate the cell-resolution field target. The composite reads canvas
   * size from `drawingBufferWidth`, so a sub-cell viewport change (e.g. a mobile
   * URL bar) needs no texture churn.
   */
  resize(dims: Dims, dpr: number): void {
    const gl = this.gl;
    const gridChanged =
      !this.dims || this.dims.cols !== dims.cols || this.dims.rows !== dims.rows;
    this.dims = dims;
    this.dpr = dpr;
    if (!gridChanged && this.fieldTex && this.fbo) return;

    if (!this.fieldTex) this.fieldTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.fieldTex);
    gl.texImage2D(
      gl.TEXTURE_2D, 0, gl.RGBA8, dims.cols, dims.rows, 0, gl.RGBA, gl.UNSIGNED_BYTE, null,
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    if (!this.fbo) this.fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.fieldTex, 0,
    );
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  /** True once colors, atlas, and grid are all set — safe to draw. */
  get ready(): boolean {
    return !!(this.atlas && this.atlasTex && this.fieldTex && this.fbo && this.dims);
  }

  draw(time: number, pointer: GLPointer | null): void {
    if (!this.ready) return;
    const gl = this.gl;
    const p = this.params;
    const dims = this.dims!;
    const atlas = this.atlas!;

    gl.bindVertexArray(this.vao);
    gl.disable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);

    // --- Pass 1: field → cell-resolution FBO ---
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
    gl.viewport(0, 0, dims.cols, dims.rows);
    gl.useProgram(this.fieldProg);
    const f = this.fieldU;
    gl.uniform1f(f.uTime, time);
    gl.uniform1f(f.uFlowScale, p.flowScale);
    gl.uniform1f(f.uDensityScale, p.densityScale);
    gl.uniform1f(f.uTimeSpeed, p.timeSpeed);
    gl.uniform1f(f.uTurbulence, p.turbulence);
    gl.uniform1f(f.uWarp, p.warp);
    gl.uniform1f(f.uDrift, p.drift);
    gl.uniform1i(f.uOctaves, Math.max(1, p.octaves | 0));
    gl.uniform1f(f.uAccentRatio, p.accentRatio);
    gl.uniform1f(f.uBlankThreshold, p.blankThreshold);
    gl.uniform1f(f.uBlockThreshold, p.blockThreshold);
    gl.uniform1f(f.uMinOpacity, p.minOpacity);
    gl.uniform1f(f.uCellSize, p.cellSize);
    gl.uniform1f(f.uPointerInfluence, p.pointerInfluence);
    gl.uniform1f(f.uPointerRadius, p.pointerRadius);
    gl.uniform1f(f.uPointerActive, pointer ? 1 : 0);
    gl.uniform2f(f.uPointer, pointer?.col ?? 0, pointer?.row ?? 0);
    gl.uniform1i(f.uDirBase, atlas.dirBase);
    gl.uniform1i(f.uDirCount, Math.max(1, atlas.dirCount));
    gl.uniform1i(f.uBlockBase, atlas.blockBase);
    gl.uniform1i(f.uBlockCount, Math.max(1, atlas.blockCount));
    gl.uniform1i(f.uBgIndex, atlas.bgIndex);
    gl.uniform1i(f.uBuckets, p.angleMode === "8" ? 8 : 4);
    gl.uniform3fv(f.uOffFlow, this.offsets.flow);
    gl.uniform3fv(f.uOffDensity, this.offsets.density);
    gl.uniform3fv(f.uOffWarp, this.offsets.warp);
    gl.uniform3fv(f.uOffAccent, this.offsets.accent);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // --- Pass 2: composite → canvas ---
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.useProgram(this.compositeProg);
    const c = this.compositeU;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.fieldTex);
    gl.uniform1i(c.uField, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.atlasTex);
    gl.uniform1i(c.uAtlas, 1);
    gl.uniform2f(c.uResolution, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.uniform1f(c.uDpr, this.dpr);
    gl.uniform1f(c.uCellPx, dims.cell);
    gl.uniform2f(c.uGrid, dims.cols, dims.rows);
    gl.uniform2f(c.uAtlasTiles, atlas.tilesPerRow, atlas.tileRows);
    gl.uniform3fv(c.uBg, this.bg);
    gl.uniform3fv(c.uPrimary, this.primary);
    gl.uniform3fv(c.uAccent, this.accent);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    gl.bindVertexArray(null);
  }

  /**
   * Delete every GL resource this renderer owns. We deliberately do NOT force
   * `WEBGL_lose_context` here: React cleanup also fires on StrictMode's throwaway
   * unmount, which reuses the SAME canvas (and its single context) on remount —
   * losing it would leave the remount with a dead context. Deleting the objects
   * is enough; the context itself is freed by GC when the canvas node is removed.
   */
  dispose(): void {
    const gl = this.gl;
    gl.deleteProgram(this.fieldProg);
    gl.deleteProgram(this.compositeProg);
    gl.deleteShader(this.vs);
    if (this.vao) gl.deleteVertexArray(this.vao);
    if (this.atlasTex) gl.deleteTexture(this.atlasTex);
    if (this.fieldTex) gl.deleteTexture(this.fieldTex);
    if (this.fbo) gl.deleteFramebuffer(this.fbo);
    this.atlasTex = this.fieldTex = null;
    this.fbo = null;
    this.vao = null;
  }
}
