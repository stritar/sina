/**
 * Prop-table data modules.
 *
 * Each `<slug>.props.mjs` in this directory is the single source of truth for a
 * primitive's docs props table. The MDX page imports the module's
 * `<x>PropRows()` helper, and `scripts/generate-dsds.mjs` reads the same module
 * to emit the DSDS `api` block — so the visible table and the machine-readable
 * catalog can never drift.
 *
 * Plain .mjs (not .ts) so the Node generator imports it without a loader; the
 * docs guard (`content/dsds.test.ts`) bans em/en-dashes in the descriptions.
 *
 * @typedef {{ prop: string, type: string, default?: string, description: string }} PropRow
 * @typedef {{ component: string, props: PropRow[] }} PropDoc
 */

/**
 * Rows for `<PropsTable>`.
 *
 * @param {PropDoc} doc
 * @returns {PropRow[]}
 */
export function rowsFor(doc) {
  return doc.props;
}
