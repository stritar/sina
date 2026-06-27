/**
 * @sina-design-system/core — internal styling utility
 *
 * `cn()` merges class lists with clsx (conditional/array syntax) and resolves
 * Tailwind conflicts with tailwind-merge, so a caller's `className` override wins
 * over a primitive's defaults. Internal only — not part of the public surface.
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
