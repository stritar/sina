/**
 * @sina-design-system/core — Chart
 *
 * A headless sparkline / mini-chart: a compact SVG trend rendered from a numeric
 * series. Domain-agnostic (it knows nothing about prices or balances) and styled
 * only via theme tokens — the stroke/fill follow `currentColor`, so a consumer
 * colors it with a `text-*` token (`text-primary`, `text-success`, …), dark mode
 * included. Purely presentational (no hooks) → server-mountable, no `"use client"`.
 *
 * A11y: the whole figure is one labelled image — the wrapper carries
 * `role="img"` + an `aria-label` (the human-readable trend), and the SVG geometry
 * is `aria-hidden`, so a screen reader gets the summary, not a heap of path data.
 */

import type { CSSProperties } from "react";
import { cn } from "../utils/cn.js";

export type ChartVariant = "line" | "area" | "bar";

export interface ChartProps {
  /** The series, in order. Empty/short series degrade to a flat baseline. */
  data: number[];
  /** Line, filled area, or bars. */
  variant?: ChartVariant;
  /** viewBox width in user units (the SVG scales to its container via `w-*`). */
  width?: number;
  /** viewBox height in user units. */
  height?: number;
  /** Accessible description of the trend (required — this is the figure's name). */
  label: string;
  /** Stroke width in user units. */
  strokeWidth?: number;
  /** Color via a theme `text-*` token (drives `currentColor`) + sizing utilities. */
  className?: string;
  style?: CSSProperties;
}

/** Map a value to a Y coordinate (SVG y grows downward), inset by the stroke. */
function project(value: number, min: number, span: number, height: number, pad: number): number {
  if (span === 0) return height / 2;
  const t = (value - min) / span;
  return height - pad - t * (height - pad * 2);
}

export function Chart({
  data,
  variant = "line",
  width = 120,
  height = 40,
  label,
  strokeWidth = 2,
  className,
  style,
}: ChartProps) {
  const pad = strokeWidth;
  const points = data.filter((n) => Number.isFinite(n));
  const min = points.length ? Math.min(...points) : 0;
  const max = points.length ? Math.max(...points) : 0;
  const span = max - min;

  // X positions spread evenly; a single point sits at the left edge.
  const step = points.length > 1 ? (width - pad * 2) / (points.length - 1) : 0;
  const coords = points.map((value, i) => ({
    x: pad + i * step,
    y: project(value, min, span, height, pad),
  }));

  return (
    <span
      role="img"
      aria-label={label}
      className={cn("inline-block text-primary", className)}
      style={style}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
        className="h-full w-full overflow-visible"
      >
        {coords.length === 0 ? (
          <line
            x1={pad}
            y1={height / 2}
            x2={width - pad}
            y2={height / 2}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            opacity={0.4}
          />
        ) : variant === "bar" ? (
          coords.map((c, i) => {
            const barWidth = Math.max(1, step * 0.6);
            return (
              <rect
                key={i}
                x={c.x - barWidth / 2}
                y={c.y}
                width={barWidth}
                height={Math.max(0, height - pad - c.y)}
                fill="currentColor"
                rx={1}
              />
            );
          })
        ) : (
          <>
            {variant === "area" && (
              <path
                d={
                  `M ${coords[0]!.x} ${height - pad} ` +
                  coords.map((c) => `L ${c.x} ${c.y}`).join(" ") +
                  ` L ${coords[coords.length - 1]!.x} ${height - pad} Z`
                }
                fill="currentColor"
                opacity={0.15}
              />
            )}
            <polyline
              points={coords.map((c) => `${c.x},${c.y}`).join(" ")}
              fill="none"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </>
        )}
      </svg>
    </span>
  );
}

Chart.displayName = "Chart";
