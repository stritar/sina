import styles from "./Tables.module.css";

/**
 * Consistent reference tables (Radix pattern). Base cell styling comes from the
 * docs `.prose table` rules; these add a horizontal-scroll wrapper (so a wide
 * table never scrolls the page body) and mono formatting for the code cells.
 */

export function PropsTable({
  rows,
}: {
  rows: Array<{ prop: string; type: string; default?: string; description: string }>;
}) {
  return (
    <div className={styles.wrap}>
      <table>
        <thead>
          <tr>
            <th>Prop</th>
            <th>Type</th>
            <th>Default</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.prop}>
              <td>
                <code>{r.prop}</code>
              </td>
              <td>
                <code>{r.type}</code>
              </td>
              <td>{r.default ? <code>{r.default}</code> : "—"}</td>
              <td>{r.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function KeyboardTable({
  rows,
}: {
  rows: Array<{ keys: string; description: string }>;
}) {
  return (
    <div className={styles.wrap}>
      <table>
        <thead>
          <tr>
            <th>Key</th>
            <th>Behaviour</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.keys}>
              <td>
                {r.keys.split(" / ").map((k) => (
                  <kbd key={k} className={styles.kbd}>
                    {k}
                  </kbd>
                ))}
              </td>
              <td>{r.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DataAttrTable({
  rows,
}: {
  rows: Array<{ attr: string; values?: string; description: string }>;
}) {
  return (
    <div className={styles.wrap}>
      <table>
        <thead>
          <tr>
            <th>Data attribute</th>
            <th>Values</th>
            <th>Present when</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.attr}>
              <td>
                <code>{r.attr}</code>
              </td>
              <td>{r.values ? <code>{r.values}</code> : "—"}</td>
              <td>{r.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
