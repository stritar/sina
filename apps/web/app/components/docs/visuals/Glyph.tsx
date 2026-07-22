import type { ReactNode, SVGProps } from "react";

/**
 * Hand-authored inline SVG glyph set for the docs visual kit. apps/web carries no
 * `@phosphor-icons/react` dependency, and the docs chrome already hand-authors its
 * SVGs (see `DocsHeader`) — so we keep the kit self-contained and Cloudflare-safe.
 * Every glyph is `currentColor`-driven, bold-weight (stroke 2), and `aria-hidden`
 * (meaning is carried by the adjacent text, per the SINA status-glyph convention).
 */

export type GlyphName =
  | "info"
  | "check"
  | "warning"
  | "danger"
  | "shield"
  | "lock"
  | "arrow"
  | "gate"
  | "layers"
  | "book"
  | "code";

const PATHS: Record<GlyphName, ReactNode> = {
  // Info — circle + i (mirrors Phosphor Info, bold).
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11.5v4.5" />
      <circle cx="12" cy="7.75" r="1.15" fill="currentColor" stroke="none" />
    </>
  ),
  // Success/tip — circle + check (mirrors CheckCircle, bold).
  check: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.4l2.6 2.6L16 9.4" />
    </>
  ),
  // Warning — triangle + ! (mirrors Warning, bold).
  warning: (
    <>
      <path d="M12 3.2 22 20H2z" />
      <path d="M12 9.5v4.2" />
      <circle cx="12" cy="16.8" r="1.05" fill="currentColor" stroke="none" />
    </>
  ),
  // Danger/error — octagon + ! (mirrors WarningOctagon, bold).
  danger: (
    <>
      <path d="M8.2 3h7.6L21 8.2v7.6L15.8 21H8.2L3 15.8V8.2z" />
      <path d="M12 8v5" />
      <circle cx="12" cy="16.3" r="1.05" fill="currentColor" stroke="none" />
    </>
  ),
  // Governance — shield + check.
  shield: (
    <>
      <path d="M12 3 5 5.6V12c0 4.2 3 7.3 7 8.4 4-1.1 7-4.2 7-8.4V5.6z" />
      <path d="M9 12l2.2 2.2L15.2 10" />
    </>
  ),
  // Enforced — padlock.
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="9.5" rx="2" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </>
  ),
  arrow: <path d="M5 12h13M12.5 6l6 6-6 6" />,
  // Gate — a funnel (schema gate).
  gate: <path d="M3 5h18l-7 8v6l-4-2v-4z" />,
  // Layers — the three-layer architecture.
  layers: (
    <>
      <path d="M12 3 3 8l9 5 9-5z" />
      <path d="M3 12l9 5 9-5" />
      <path d="M3 16l9 5 9-5" />
    </>
  ),
  book: (
    <>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" />
      <path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20" />
    </>
  ),
  code: <path d="M9 8l-5 4 5 4M15 8l5 4-5 4" />,
};

export function Glyph({
  name,
  size = 20,
  ...rest
}: { name: GlyphName; size?: number } & Omit<SVGProps<SVGSVGElement>, "name">) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {PATHS[name]}
    </svg>
  );
}
