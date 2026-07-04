/**
 * @sina-design-system/core — internal styling utility
 *
 * `cn()` merges class lists with clsx (conditional/array syntax). Post-Tailwind,
 * a primitive's classes are co-located CSS Module names plus any passthrough
 * `className`, so there are no utility conflicts to resolve — clsx is enough.
 * Internal only — not part of the public surface.
 */

import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
