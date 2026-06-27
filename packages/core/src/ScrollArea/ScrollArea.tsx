/**
 * @sina-design-system/core — ScrollArea
 *
 * Scrollable region with a styled, overlay scrollbar on Radix ScrollArea. Keeps
 * overflow inside a fixed body without breaking a surrounding focus trap — so a
 * long summary / approval block can live inside a `Dialog`. Composed into one
 * export (Root + Viewport + Scrollbar + Thumb). Domain-agnostic.
 */
"use client";

import { ScrollArea as Primitive } from "radix-ui";
import { forwardRef } from "react";
import type { ComponentPropsWithoutRef, ComponentRef } from "react";
import { cn } from "../utils/cn.js";

export const ScrollArea = forwardRef<
  ComponentRef<typeof Primitive.Root>,
  ComponentPropsWithoutRef<typeof Primitive.Root>
>(({ className, children, ...props }, ref) => (
  <Primitive.Root ref={ref} className={cn("relative overflow-hidden", className)} {...props}>
    <Primitive.Viewport className="size-full rounded-[inherit]">{children}</Primitive.Viewport>
    <Primitive.Scrollbar
      orientation="vertical"
      className="flex w-2 touch-none select-none transition-colors duration-fast ease-standard"
    >
      <Primitive.Thumb className="relative flex-1 rounded-full bg-border" />
    </Primitive.Scrollbar>
    <Primitive.Scrollbar
      orientation="horizontal"
      className="flex h-2 flex-col touch-none select-none transition-colors duration-fast ease-standard"
    >
      <Primitive.Thumb className="relative flex-1 rounded-full bg-border" />
    </Primitive.Scrollbar>
    <Primitive.Corner />
  </Primitive.Root>
));
ScrollArea.displayName = "ScrollArea";
