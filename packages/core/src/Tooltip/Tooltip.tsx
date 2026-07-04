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
import styles from "./Tooltip.module.css";

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
      className={cn(styles.content, className)}
      {...props}
    >
      {children}
    </Primitive.Content>
  </Primitive.Portal>
));
TooltipContent.displayName = "TooltipContent";
