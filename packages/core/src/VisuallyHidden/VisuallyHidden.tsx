/**
 * @sina-design-system/core — VisuallyHidden
 *
 * Hides content visually while keeping it available to assistive tech. Thin
 * wrapper over Radix VisuallyHidden — the a11y substrate for icon-only buttons,
 * Dialog titles/descriptions, and any screen-reader-only label across core.
 * Domain-agnostic.
 */
import { VisuallyHidden as Primitive } from "radix-ui";
import { forwardRef } from "react";
import type { ComponentPropsWithoutRef, ComponentRef } from "react";

export type VisuallyHiddenProps = ComponentPropsWithoutRef<typeof Primitive.Root>;

export const VisuallyHidden = forwardRef<
  ComponentRef<typeof Primitive.Root>,
  VisuallyHiddenProps
>((props, ref) => <Primitive.Root ref={ref} {...props} />);

VisuallyHidden.displayName = "VisuallyHidden";
