import type { ReactNode } from "react";
import styles from "./Steps.module.css";

/**
 * Numbered steps for the Quickstart and guides. Rendered as a role="list" of
 * divs (not `<ol>`) so the docs' `.prose ol` list styling never fights the step
 * numbering; the count comes from a CSS counter. Put a `<Callout variant="tip">`
 * inside a step for the "you should now see…" checkpoint.
 */

export function Steps({ children }: { children: ReactNode }) {
  return (
    <div className={styles.steps} role="list">
      {children}
    </div>
  );
}

export function Step({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className={styles.step} role="listitem">
      <div className={styles.body}>
        {title ? <p className={styles.title}>{title}</p> : null}
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
