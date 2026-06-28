/**
 * @sina-design-system/core — internal styling utility
 *
 * `cn()` merges class lists with clsx (conditional/array syntax) and resolves
 * Tailwind conflicts with tailwind-merge, so a caller's `className` override wins
 * over a primitive's defaults. Internal only — not part of the public surface.
 */

import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// The theme adds a custom `ui` font-size (`text-ui`). tailwind-merge's default
// config doesn't know `ui` is a size, so it treats `text-ui` as a text *color*
// and drops a preceding `text-<color>` (e.g. `text-primary-fg`) from the same
// group — silently erasing the foreground color. Register `ui` as a font-size
// so `text-ui` and `text-primary-fg` stop colliding.
const twMerge = extendTailwindMerge({
  extend: { classGroups: { "font-size": [{ text: ["ui"] }] } },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
