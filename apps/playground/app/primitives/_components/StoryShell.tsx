import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import styles from "./StoryShell.module.css";

/** Consistent isolation frame for a primitive story. */
export function StoryShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className={styles.shell}>
      <Link href="/primitives" className={styles.backLink}>
        ← Primitives
      </Link>
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.body}>{children}</div>
    </main>
  );
}

/** A labeled demo cell on a surface card. */
export function Demo({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className={styles.section}>
      <h2 className={styles.demoLabel}>{label}</h2>
      <div className={styles.demoStage}>{children}</div>
    </section>
  );
}

/**
 * A single specimen: a control centered over an 11px muted caption — mirrors the
 * captioned examples in the Figma component pages (focus / disabled / … ).
 */
export function Specimen({ caption, children }: { caption: string; children: ReactNode }) {
  return (
    <div className={styles.specimen}>
      {children}
      <span className={styles.caption}>{caption}</span>
    </div>
  );
}

type Axis<T> = { key: T; label: string };

/**
 * A labeled combinatorial grid: one row per `rows` entry, one column per `cols`
 * entry, with `render(row, col)` filling each cell. Header labels run across the
 * top; the leading column shows each row's label.
 */
export function Matrix<R extends string, C extends string>({
  label,
  rows,
  cols,
  render,
}: {
  label: string;
  rows: Axis<R>[];
  cols: Axis<C>[];
  render: (row: R, col: C) => ReactNode;
}) {
  return (
    <section className={styles.section}>
      <h2 className={styles.matrixLabel}>{label}</h2>
      <div className={styles.matrixScroll}>
        <div
          className={styles.matrixGrid}
          style={{ gridTemplateColumns: `auto repeat(${cols.length}, minmax(0, 1fr))` }}
        >
          <div />
          {cols.map((col) => (
            <div key={col.key} className={styles.colHead}>
              {col.label}
            </div>
          ))}
          {rows.map((row) => (
            <Fragment key={row.key}>
              <div className={styles.rowHead}>{row.label}</div>
              {cols.map((col) => (
                <div key={col.key} className={styles.cell}>
                  {render(row.key, col.key)}
                </div>
              ))}
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
