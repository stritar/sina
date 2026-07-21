/**
 * Prop-table data modules.
 *
 * Each `<slug>.props.mjs` in this directory is the single source of truth for a
 * primitive's docs props table: the English rows plus per-locale description
 * maps. The MDX page (English and every locale sibling) imports the module's
 * `<x>PropRows(locale)` helper, and `scripts/generate-dsds.mjs` reads the same
 * module to emit the DSDS `api` block — so the visible table and the
 * machine-readable catalog can never drift.
 *
 * Plain .mjs (not .ts) so the Node generator imports it without a loader; the
 * docs guard (`content/dsds.test.ts`) enforces key parity between `props` and
 * every `i18n` map, and bans em/en-dashes in the English descriptions.
 *
 * @typedef {{ prop: string, type: string, default?: string, description: string }} PropRow
 * @typedef {"es" | "zh" | "fr" | "de" | "ja"} PropLocale
 * @typedef {{ component: string, props: PropRow[], i18n: Record<PropLocale, Record<string, string>> }} PropDoc
 */

/**
 * Rows for `<PropsTable>`, descriptions localized. Locale omitted = English.
 *
 * @param {PropDoc} doc
 * @param {PropLocale} [locale]
 * @returns {PropRow[]}
 */
export function rowsFor(doc, locale) {
  if (!locale) return doc.props;
  return doc.props.map((row) => ({
    ...row,
    description: doc.i18n[locale]?.[row.prop] ?? row.description,
  }));
}
