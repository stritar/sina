"use client";

// Decorative hero background: the glyph flow-field, rendered on the GPU via WebGL2
// (a two-pass fragment-shader pipeline — see gl/gl-renderer.ts) so the animation
// costs two draw calls per frame instead of a full-box CPU repaint. The canvas
// fills its own container (the hero's left text box, not the viewport): it measures
// the wrapper element and tracks its size with a ResizeObserver, and its only
// intrinsic motion is a slow horizontal drift.
//
// Robustness: if WebGL2 is unavailable (old browser, jsdom/SSR) the effect draws a
// single static frame with the Canvas-2D fallback renderer, and no-ops entirely
// when even 2D is missing — so it never crashes SSR or tests. WebGL context loss
// is caught and the renderer is rebuilt on restore. Power: the loop is capped to
// ~30fps and fully paused when the tab is hidden or the window is blurred.

import { useEffect, useRef } from "react";
import { Field } from "./field";
import { Renderer, type Dims } from "./renderer";
import { SINA_GLYPH_FIELD } from "./params";
import { GLRenderer, type GLPointer } from "./gl/gl-renderer";
import { buildAtlas } from "./gl/atlas";
import { parseColor, type RGB } from "./gl/color";
import styles from "./GlyphField.module.css";

const COLOR_VARS = {
  background: "--sina-glyphfield-bg",
  primaryColor: "--sina-glyphfield-primary",
  accentColor: "--sina-glyphfield-accent",
} as const;

const FRAME_MS = 1000 / 30; // cap the drift to ~30fps — a decorative element

export function GlyphField() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;

    const params = { ...SINA_GLYPH_FIELD };
    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let dims: Dims = { cssW: 0, cssH: 0, cols: 0, rows: 0, cell: params.cellSize };
    let pointerClient: { x: number; y: number } | null = null;
    let colors: { bg: RGB; primary: RGB; accent: RGB } = {
      bg: [0.96, 0.96, 0.95],
      primary: [0.84, 0.86, 0.82],
      accent: [0.78, 0.8, 0.76],
    };

    // ---- Try WebGL2; fall back to a one-shot Canvas-2D frame; else no-op ----
    let gl: WebGL2RenderingContext | null = null;
    try {
      gl = canvas.getContext("webgl2", {
        powerPreference: "low-power",
        antialias: false,
        alpha: false,
        depth: false,
        stencil: false,
        preserveDrawingBuffer: false,
      }) as WebGL2RenderingContext | null;
    } catch {
      gl = null;
    }

    let ctx2d: CanvasRenderingContext2D | null = null;
    let fallback: { field: Field; renderer: Renderer } | null = null;
    if (!gl) {
      try {
        ctx2d = canvas.getContext("2d");
      } catch {
        ctx2d = null;
      }
      if (!ctx2d) return; // jsdom / no canvas support → render nothing observable
      fallback = { field: new Field(params.seed), renderer: new Renderer(ctx2d) };
    }

    /** Read the theme's `--sina-glyphfield-*` values (as strings and floats). */
    function readColors(): void {
      const cs = getComputedStyle(canvas!);
      const bg = cs.getPropertyValue(COLOR_VARS.background).trim();
      const primary = cs.getPropertyValue(COLOR_VARS.primaryColor).trim();
      const accent = cs.getPropertyValue(COLOR_VARS.accentColor).trim();
      if (bg) params.background = bg;
      if (primary) params.primaryColor = primary;
      if (accent) params.accentColor = accent;
      colors = {
        bg: parseColor(params.background, colors.bg),
        primary: parseColor(params.primaryColor, colors.primary),
        accent: parseColor(params.accentColor, colors.accent),
      };
      glr?.setColors(colors.bg, colors.primary, colors.accent);
    }

    function measure(): { dpr: number } {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const rect = root!.getBoundingClientRect();
      const cssW = Math.max(1, Math.round(rect.width));
      const cssH = Math.max(1, Math.round(rect.height));
      const cell = Math.max(4, params.cellSize);
      canvas!.width = Math.round(cssW * dpr);
      canvas!.height = Math.round(cssH * dpr);
      canvas!.style.width = `${cssW}px`;
      canvas!.style.height = `${cssH}px`;
      dims = {
        cssW,
        cssH,
        cell,
        cols: Math.ceil(cssW / cell) + 1,
        rows: Math.ceil(cssH / cell) + 1,
      };
      return { dpr };
    }

    // ---- GPU path ----
    let glr: GLRenderer | null = null;
    let clock = 0;
    let lastDraw = 0;
    let raf = 0;

    function pointerCell(): GLPointer | null {
      if (reduced || !pointerClient) return null;
      // Shader space is bottom-up; client Y is top-down.
      return {
        col: pointerClient.x / dims.cell,
        row: (dims.cssH - pointerClient.y) / dims.cell,
      };
    }

    function drawOnce(): void {
      glr?.draw(clock, pointerCell());
    }

    function loop(now: number): void {
      raf = requestAnimationFrame(loop);
      if (lastDraw !== 0 && now - lastDraw < FRAME_MS) return; // 30fps cap
      const dt = lastDraw === 0 ? 0 : Math.min(0.05, (now - lastDraw) / 1000);
      lastDraw = now;
      clock += dt;
      drawOnce();
    }

    function startLoop(): void {
      if (raf || reduced || !glr) return;
      lastDraw = 0;
      raf = requestAnimationFrame(loop);
    }
    function stopLoop(): void {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    }

    /** Build/rebuild every GL resource (also the context-restore path). */
    function initGL(): boolean {
      if (!gl) return false;
      try {
        glr = new GLRenderer(gl, params);
        glr.setAtlas(buildAtlas(params));
        readColors();
        const { dpr } = measure();
        glr.resize(dims, dpr);
        return true;
      } catch {
        glr?.dispose();
        glr = null;
        return false;
      }
    }

    // ---- Fallback path: one static Canvas-2D frame ----
    function drawFallback(): void {
      if (!fallback) return;
      const { dpr } = measure();
      ctx2d!.setTransform(dpr, 0, 0, dpr, 0, 0);
      readColors();
      fallback.renderer.draw(fallback.field, params, 0, dims, null, { col: 0, row: 0 });
    }

    // ---- Shared listeners ----
    function onPointerMove(e: MouseEvent): void {
      // Client coords are viewport-based; the field now lives in a box, so map
      // them into box space and ignore the pointer while it is outside the box.
      const r = root!.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      pointerClient =
        x < 0 || y < 0 || x > r.width || y > r.height ? null : { x, y };
    }
    function onPointerLeave(): void {
      pointerClient = null;
    }

    let resizePending = false;
    function onResize(): void {
      if (resizePending) return;
      resizePending = true;
      requestAnimationFrame(() => {
        resizePending = false;
        if (glr) {
          const { dpr } = measure();
          glr.resize(dims, dpr);
          if (reduced) drawOnce();
        } else if (fallback) {
          drawFallback();
        }
      });
    }

    function onTheme(): void {
      readColors();
      if (glr && reduced) drawOnce();
      else if (fallback) drawFallback();
    }

    const themeObserver = new MutationObserver(onTheme);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "class"],
    });
    window.addEventListener("resize", onResize);
    // The box (not the viewport) drives the canvas size, so track it directly:
    // the hero column reflows on font load and at the responsive breakpoints.
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(onResize);
      resizeObserver.observe(root);
    }
    if (!reduced) {
      window.addEventListener("mousemove", onPointerMove, { passive: true });
      window.addEventListener("mouseleave", onPointerLeave);
    }

    // ---- Context loss / restore (GPU only) ----
    function onContextLost(e: Event): void {
      e.preventDefault();
      stopLoop();
      glr = null; // resources are gone; do not touch them
    }
    function onContextRestored(): void {
      if (initGL()) {
        if (reduced) drawOnce();
        else startLoop();
      }
    }
    if (gl) {
      canvas.addEventListener("webglcontextlost", onContextLost, false);
      canvas.addEventListener("webglcontextrestored", onContextRestored, false);
    }

    // ---- Power: pause when hidden or blurred ----
    function onVisibility(): void {
      if (document.hidden) stopLoop();
      else startLoop();
    }
    if (gl && !reduced) {
      document.addEventListener("visibilitychange", onVisibility);
      window.addEventListener("blur", stopLoop);
      window.addEventListener("focus", startLoop);
    }

    // ---- Boot ----
    let usingGL = false;
    if (gl) usingGL = initGL();
    if (usingGL) {
      drawOnce(); // paint frame 0 synchronously — no black flash before the loop
      if (!reduced) startLoop();
    } else if (fallback) {
      drawFallback();
    } else {
      // A WebGL2 context was acquired but init failed (a canvas can't then hand
      // out a 2D context). Hide the canvas and let the .root token background show.
      canvas.style.display = "none";
    }

    return () => {
      stopLoop();
      themeObserver.disconnect();
      resizeObserver?.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("mouseleave", onPointerLeave);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      canvas.removeEventListener("webglcontextrestored", onContextRestored);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", stopLoop);
      window.removeEventListener("focus", startLoop);
      glr?.dispose();
      glr = null;
    };
  }, []);

  return (
    <div ref={rootRef} className={styles.root} aria-hidden="true">
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
