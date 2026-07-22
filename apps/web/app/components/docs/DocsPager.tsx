import Link from "next/link";
import { findNeighbour } from "fumadocs-core/server";
import { source } from "@/lib/source";
import { messages } from "./messages";
import styles from "./DocsPager.module.css";

/**
 * Previous / Next links at the bottom of every docs page, derived from the
 * same page tree the sidebar renders — guided linear reading without touching
 * `meta.json` twice. Server component; the tree order is the nav order.
 */
export function DocsPager({ url }: { url: string }) {
  const { previous, next } = findNeighbour(source.getPageTree(), url);
  if (!previous && !next) return null;

  return (
    <nav className={styles.pager} aria-label="Docs pagination">
      {previous ? (
        <Link href={previous.url} className={styles.link}>
          <span className={styles.eyebrow}>← {messages.pager.previous}</span>
          <span className={styles.name}>{previous.name}</span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link href={next.url} className={`${styles.link} ${styles.next}`}>
          <span className={styles.eyebrow}>{messages.pager.next} →</span>
          <span className={styles.name}>{next.name}</span>
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
