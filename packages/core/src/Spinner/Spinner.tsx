/**
 * @sina-design-system/core — Spinner
 *
 * Indeterminate pending indicator. `role="status"` with a screen-reader label so
 * the busy state is announced; the glyph itself is decorative and reduced-motion
 * aware. Domain-agnostic — in SINA it marks the "validating…" beat while the
 * constitution gate runs server-side, but it carries no governance meaning.
 */
import { CircleNotch } from "@phosphor-icons/react/dist/ssr";
import { cn } from "../utils/cn.js";
import { VisuallyHidden } from "../VisuallyHidden/VisuallyHidden.js";

const SIZES = {
  sm: "size-control-2xs",
  md: "size-control-xs",
  lg: "size-control-sm",
} as const;

export interface SpinnerProps {
  size?: keyof typeof SIZES;
  /** Screen-reader label announcing the pending state. */
  label?: string;
  className?: string;
}

export function Spinner({ size = "md", label = "Loading", className }: SpinnerProps) {
  return (
    <span role="status" className={cn("inline-flex text-text-muted", className)}>
      <CircleNotch
        aria-hidden
        weight="bold"
        className={cn(SIZES[size], "animate-spin motion-reduce:animate-none")}
      />
      <VisuallyHidden>{label}</VisuallyHidden>
    </span>
  );
}
