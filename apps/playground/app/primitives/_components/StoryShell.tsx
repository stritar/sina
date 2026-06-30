import Link from "next/link";
import { Fragment, type ReactNode } from "react";

/** Consistent isolation frame for a primitive story. */
export function StoryShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="mx-auto min-h-screen max-w-2xl bg-bg p-8 text-text">
      <Link
        href="/primitives"
        className="font-mono text-xs text-text-muted hover:text-text"
      >
        ← Primitives
      </Link>
      <h1 className="mt-3 text-xl font-semibold tracking-tight">{title}</h1>
      <div className="mt-6 flex flex-col gap-6">{children}</div>
    </main>
  );
}

/** A labeled demo cell on a surface card. */
export function Demo({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-mono text-xs uppercase tracking-wide text-text-subtle">{label}</h2>
      <div className="flex flex-wrap items-start gap-3 rounded-lg border border-border-subtle bg-surface p-4">
        {children}
      </div>
    </section>
  );
}

/**
 * A single specimen: a control centered over an 11px muted caption — mirrors the
 * captioned examples in the Figma component pages (focus / disabled / … ).
 */
export function Specimen({ caption, children }: { caption: string; children: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2">
      {children}
      <span className="text-[11px] text-text-subtle">{caption}</span>
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
    <section className="flex flex-col gap-3">
      <h2 className="font-mono text-xs uppercase tracking-wide text-text-muted">{label}</h2>
      <div className="overflow-x-auto rounded-lg border border-border-subtle bg-surface p-4">
        <div
          className="grid items-center gap-x-4 gap-y-3"
          style={{ gridTemplateColumns: `auto repeat(${cols.length}, minmax(0, 1fr))` }}
        >
          <div />
          {cols.map((col) => (
            <div
              key={col.key}
              className="font-mono text-[11px] uppercase tracking-wide text-text-muted"
            >
              {col.label}
            </div>
          ))}
          {rows.map((row) => (
            <Fragment key={row.key}>
              <div className="pr-2 font-mono text-[11px] uppercase tracking-wide text-text-muted">
                {row.label}
              </div>
              {cols.map((col) => (
                <div key={col.key} className="flex items-center">
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
