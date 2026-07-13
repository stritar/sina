"use client";

import { Fragment, useState, type ReactNode } from "react";
import { Button } from "@sina-design-system/core";
import styles from "./shell.module.css";

/**
 * Docs demo shell — the shadcn-style building blocks every primitive page's
 * live demo module (`demos/primitives/<slug>.tsx`) composes: a `Hero` preview
 * stage, labeled `Demo` rows, captioned `Specimen`s, combinatorial `Matrix`
 * grids, an `Example` (Preview / Code) wrapper, and the `StorySource` link to
 * the playground story. Ported from the playground's StoryShell
 * (apps/playground/app/primitives/_components/StoryShell.tsx) — a variant
 * change to a primitive usually lands in both.
 */

const COPIED_RESET_MS = 1500;

/** The full-width preview card at the top of a primitive page. */
export function Hero({ children }: { children: ReactNode }) {
  return <div className={styles.hero}>{children}</div>;
}

/** A labeled demo cell on a surface card. */
export function Demo({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className={styles.section}>
      <h3 className={styles.demoLabel}>{label}</h3>
      <div className={styles.demoStage}>{children}</div>
    </section>
  );
}

/** A single specimen: a control centered over a small muted caption. */
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
 * entry, with `render(row, col)` filling each cell.
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
      <h3 className={styles.demoLabel}>{label}</h3>
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

/**
 * A demo with Preview / Code toggle: the live render in one view, its exact
 * source (with a copy button) in the other.
 */
export function Example({
  label,
  code,
  children,
}: {
  label: string;
  code: string;
  children: ReactNode;
}) {
  const [view, setView] = useState<"preview" | "code">("preview");
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), COPIED_RESET_MS);
    } catch {
      // Clipboard denied (e.g. non-secure context) — leave the label unchanged.
    }
  }

  return (
    <section className={styles.section}>
      <div className={styles.exampleBar}>
        <h3 className={styles.demoLabel}>{label}</h3>
        <div className={styles.exampleToggle}>
          <Button
            variant="ghost"
            size="sm"
            aria-pressed={view === "preview"}
            className={view === "preview" ? styles.toggleOn : undefined}
            onClick={() => setView("preview")}
          >
            Preview
          </Button>
          <Button
            variant="ghost"
            size="sm"
            aria-pressed={view === "code"}
            className={view === "code" ? styles.toggleOn : undefined}
            onClick={() => setView("code")}
          >
            Code
          </Button>
        </div>
      </div>
      {view === "preview" ? (
        <div className={styles.demoStage}>{children}</div>
      ) : (
        <div className={styles.codeWrap}>
          <Button
            variant="ghost"
            size="sm"
            className={styles.codeCopy}
            onClick={copy}
            aria-label={copied ? "Copied to clipboard" : "Copy code"}
          >
            {copied ? "Copied" : "Copy"}
          </Button>
          <pre className={styles.codePre}>
            <code>{code}</code>
          </pre>
        </div>
      )}
    </section>
  );
}

/**
 * Link to the primitive's playground story. Neither the playground nor the
 * repo is public yet, so this renders nothing — set `STORY_BASE` to the live
 * playground URL in this one place when it ships and the link reappears on
 * every primitive page.
 */
const STORY_BASE = "";

export function StorySource({ slug }: { slug: string }) {
  if (!STORY_BASE) return null;
  return (
    <p className={styles.storySource}>
      <a href={`${STORY_BASE}/${slug}`} target="_blank" rel="noreferrer">
        View the full playground story ↗
      </a>
    </p>
  );
}
