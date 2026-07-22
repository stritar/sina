import type { ReactNode } from "react";
import { Glyph } from "./Glyph";
import styles from "./Bookends.module.css";

/**
 * Concept-page bookends (react.dev pattern): a "You'll learn" box at the top and
 * a "Recap" box at the bottom. Used ONLY on pages long enough to need orientation
 * — never on a short page (the keep-it-lean rule).
 */

export function YouWillLearn({ children }: { children: ReactNode }) {
  return (
    <aside className={styles.box} aria-label="What you'll learn">
      <p className={styles.head}>
        <Glyph name="book" size={16} />
        You&rsquo;ll learn
      </p>
      <div className={styles.body}>{children}</div>
    </aside>
  );
}

export function Recap({ children }: { children: ReactNode }) {
  return (
    <aside className={styles.box + " " + styles.recap} aria-label="Recap">
      <p className={styles.head}>
        <Glyph name="check" size={16} />
        Recap
      </p>
      <div className={styles.body}>{children}</div>
    </aside>
  );
}
