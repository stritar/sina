"use client";

import { useState, type ReactNode } from "react";
import styles from "./TokenSwatch.module.css";

/**
 * Live colour swatches for the Tokens pages. The chip renders `var(--sina-*)`
 * directly, so it resolves to the reader's current light/dark theme. Clicking
 * copies the variable name — the thing you paste into your CSS.
 */

const COPIED_MS = 1200;

export function TokenSwatch({ name, note }: { name: string; note?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(`var(${name})`);
      setCopied(true);
      setTimeout(() => setCopied(false), COPIED_MS);
    } catch {
      /* clipboard denied — leave the label unchanged */
    }
  }

  return (
    <button
      type="button"
      className={styles.swatch}
      onClick={copy}
      aria-label={copied ? `Copied var(${name})` : `Copy var(${name})`}
    >
      <span className={styles.chip} style={{ background: `var(${name})` }} aria-hidden="true" />
      <span className={styles.meta}>
        <code className={styles.name}>{name}</code>
        {note ? <span className={styles.note}>{note}</span> : null}
      </span>
      <span className={styles.copy} aria-hidden="true">
        {copied ? "Copied" : "Copy"}
      </span>
    </button>
  );
}

export function TokenSwatchGrid({ children }: { children: ReactNode }) {
  return <div className={styles.grid}>{children}</div>;
}
