import { createHash } from "node:crypto";

/**
 * The freshness fingerprint of an English source page: the first 12 hex chars of
 * sha256 over its raw file contents. A translation stores this as `sourceHash`
 * in its frontmatter; the `docs-i18n` guard recomputes it from the current
 * English source and fails if they differ (English changed, translation stale).
 *
 * Shared by the guard (`docs-i18n.test.ts`) and the `/translate-docs` skill so
 * both compute the identical value. Equivalent CLI:
 *   node -e "import('./content/i18n-hash.mjs').then(m=>process.stdout.write(m.sourceHash(require('fs').readFileSync(process.argv[1],'utf8'))))" <english.mdx>
 */
export function sourceHash(englishContents) {
  return createHash("sha256").update(englishContents, "utf8").digest("hex").slice(0, 12);
}
