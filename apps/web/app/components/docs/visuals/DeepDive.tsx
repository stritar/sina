import type { ReactNode } from "react";
import styles from "./DeepDive.module.css";

/**
 * A collapsible for opt-in depth — the primary anti-bloat lever. Native
 * `<details>`/`<summary>`, so it needs no client JS and is keyboard-accessible
 * out of the box. Keep the main flow short; move the nuance in here.
 */

export function DeepDive({
  title = "Deep dive",
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <details className={styles.details}>
      <summary className={styles.summary}>
        <span className={styles.chevron} aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 6l6 6-6 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        {title}
      </summary>
      <div className={styles.content}>{children}</div>
    </details>
  );
}
