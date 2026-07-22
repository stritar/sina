/**
 * Tiny classname joiner for the docs visual kit — apps/web doesn't import
 * `core`'s `cn()`, so this mirrors the local join pattern (see `CodePre`).
 */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
