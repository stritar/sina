/**
 * @sina-design-system/core — Tooltip
 *
 * Hover/focus explainer on Radix Tooltip — e.g. *why* something is blocked or
 * needs approval. Dark bubble (inverse tokens); appears on
 * both hover and keyboard focus. Ships as named exports (TooltipProvider /
 * Tooltip / TooltipTrigger / TooltipContent) so each is its own client reference
 * across the RSC boundary. Domain-agnostic.
 */
"use client";

import { Tooltip as Primitive } from "radix-ui";
import { forwardRef } from "react";
import type { ComponentPropsWithoutRef, ComponentRef } from "react";
import { cn } from "../utils/cn.js";

export const TooltipProvider = Primitive.Provider;
export const Tooltip = Primitive.Root;
export const TooltipTrigger = Primitive.Trigger;

export const TooltipContent = forwardRef<
  ComponentRef<typeof Primitive.Content>,
  ComponentPropsWithoutRef<typeof Primitive.Content>
>(({ className, children, sideOffset = 4, ...props }, ref) => (
  <Primitive.Portal>
    <Primitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-dropdown max-w-xs rounded-sm bg-text px-2 py-1 text-xs text-bg shadow-sm",
        "data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95",
        "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
        className,
      )}
      {...props}
    >
      {children}
    </Primitive.Content>
  </Primitive.Portal>
));
TooltipContent.displayName = "TooltipContent";
