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
import styles from "./ScrollArea.module.css";

export const ScrollArea = forwardRef<
  ComponentRef<typeof Primitive.Root>,
  ComponentPropsWithoutRef<typeof Primitive.Root>
>(({ className, children, ...props }, ref) => (
  <Primitive.Root ref={ref} className={cn(styles.root, className)} {...props}>
    <Primitive.Viewport className={styles.viewport}>{children}</Primitive.Viewport>
    <Primitive.Scrollbar
      orientation="vertical"
      className={cn(styles.scrollbar, styles.scrollbarVertical)}
    >
      <Primitive.Thumb className={styles.thumb} />
    </Primitive.Scrollbar>
    <Primitive.Scrollbar
      orientation="horizontal"
      className={cn(styles.scrollbar, styles.scrollbarHorizontal)}
    >
      <Primitive.Thumb className={styles.thumb} />
    </Primitive.Scrollbar>
    <Primitive.Corner />
  </Primitive.Root>
));
ScrollArea.displayName = "ScrollArea";
