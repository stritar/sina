/**
 * Broadsheet class joiner — a clsx-lite so the marketing library stays
 * dependency-free (no clsx in apps/web) and isolated from packages/*.
 */
export type ClassValue = string | number | false | null | undefined;

export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(" ");
}
