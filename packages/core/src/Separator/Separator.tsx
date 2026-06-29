/**
 * @sina-design-system/core — Separator
 *
 * Hairline divider on Radix Separator. Horizontal rule or a vertical hairline
 * between inline actions. `decorative` (default true) renders it purely visual;
 * set `decorative={false}` for a semantic `role="separator"` that conveys a real
 * section boundary to assistive tech. Domain-agnostic.
 */
import { Separator as Primitive } from "radix-ui";
import { forwardRef } from "react";
import type { ComponentPropsWithoutRef, ComponentRef } from "react";
import { cn } from "../utils/cn.js";

export const Separator = forwardRef<
  ComponentRef<typeof Primitive.Root>,
  ComponentPropsWithoutRef<typeof Primitive.Root>
>(({ className, orientation = "horizontal", decorative = true, ...props }, ref) => (
  <Primitive.Root
    ref={ref}
    orientation={orientation}
    decorative={decorative}
    className={cn(
      "shrink-0 bg-border",
      orientation === "horizontal" ? "h-px w-full" : "h-full w-px self-stretch",
      className,
    )}
    {...props}
  />
));

Separator.displayName = "Separator";
